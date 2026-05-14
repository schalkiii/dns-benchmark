package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"math/rand"

	"github.com/oschwald/geoip2-golang"
	log "github.com/sirupsen/logrus"
	"github.com/skratchdot/open-golang/open"
)

const TemplateHTMLPlaceholder = "__JSON_DATA_PLACEHOLDER__"

// 全局变量
var (
	Cfg            Config
	GeoDB          *geoip2.Reader
	WorkDir        string
	TempDir        string
	DomainsBinPath string
	DnspyreBinPath string
	Servers        []string
	OutputPath     string
	OutputFile     *os.File
	RetData        BenchmarkResult
)

func main() {
	var err error
	nowTime := time.Now()
	InitLog(false, "info")

	// 初始化配置
	if Cfg, err = InitFlags(); err != nil {
		log.WithFields(log.Fields{
			"错误": err,
		}).Fatal("\x1b[31m没有有效数据,程序退出\x1b[0m")
	}
	Servers = Cfg.Servers

	InitLog(Cfg.LogJSON, Cfg.LogLevel)

	// 初始化输出文件
	OutputPath = Cfg.OutputPath
	if OutputPath == "" {
		OutputPath = fmt.Sprintf("dnspy_result_%s.json", nowTime.Local().Format("2006-01-02-15-04-05"))
	} else if filepath.Ext(OutputPath) != ".json" {
		OutputPath += ".json"
	}

	OutputFile, err = os.Create(OutputPath)
	if err != nil {
		log.WithFields(log.Fields{
			"错误":   err,
			"输出文件": OutputPath,
		}).Fatal("\x1b[31m无法创建输出文件\x1b[0m")
	}
	defer OutputFile.Close()

	log.WithFields(log.Fields{
		"输出文件": OutputPath,
	}).Infof("\x1b[32m结果输出到文件\x1b[0m")

	// 初始化 GeoIP 数据库
	GeoDB, err = InitGeoDB()
	if err != nil {
		log.WithFields(log.Fields{
			"错误": err,
		}).Fatal("\x1b[31m无法打开GeoIP数据库\x1b[0m")
	}
	defer GeoDB.Close()

	// 主函数流程
	WorkDir, err = os.Getwd()
	if err != nil {
		log.WithFields(log.Fields{
			"错误": err,
		}).Fatal("\x1b[31m无法获取当前工作目录\x1b[0m")
	}

	// 在临时文件夹中取一个文件夹
	TempDir, err = os.MkdirTemp("", "dnspy")
	if err != nil {
		log.WithFields(log.Fields{
			"错误": err,
		}).Fatal("\x1b[31m无法创建临时文件夹\x1b[0m")
	}
	defer os.RemoveAll(TempDir)
	// log.Infof("临时文件夹: %s", TempDir)

	// 配置域名数据
	if Cfg.DomainsDataPath == "@sampleDomains@" {
		domainsData, _ := GetDomainsData()
		DomainsBinPath = filepath.Join(TempDir, "domains")
		err := os.WriteFile(DomainsBinPath, domainsData, 0644)
		if err != nil {
			log.WithFields(log.Fields{
				"错误": err,
			}).Fatal("\x1b[31m无法导出域名数据\x1b[0m")
		}
	} else {
		// 取 Cfg.DomainsDataPath 相对 WorkDir 的文件路径
		DomainsBinPath = filepath.Join(WorkDir, Cfg.DomainsDataPath)
		if _, err := os.Stat(DomainsBinPath); os.IsNotExist(err) {
			log.WithFields(log.Fields{
				"错误": err,
			}).Fatal("\x1b[31m输入的域名数据文件不存在\x1b[0m")
		}
	}

	// log.Info("导出域名数据路径: ", DomainsBinPath)

	// 读取服务器列表文件
	if Cfg.ServersDataPath == "@sampleServers@" {
		serversData, _ := GetSampleServersData()
		Servers, err = FormatListData(&serversData)
	} else {
		if Cfg.ServersDataPath != "" {
			Servers, err = FormatListFile(Cfg.ServersDataPath)
			if err != nil {
				log.WithFields(log.Fields{
					"错误": err,
				}).Fatal("\x1b[31m无法格式化服务器列表文件\x1b[0m")
			}
		}
	}

	log.Infof("需要测试的服务器数量: %d", len(Servers))

	// 导出 dnspyre 二进制文件
	dnspyreBinData, filename := GetDnspyreBin()
	DnspyreBinPath = filepath.Join(TempDir, filename)
	err = os.WriteFile(DnspyreBinPath, dnspyreBinData, 0755)
	if err != nil {
		log.WithFields(log.Fields{
			"错误": err,
		}).Fatal("\x1b[31m无法写入 dnspyre 二进制文件\x1b[0m")
	}

	serverCount := len(Servers)
	// 检查是否有有效数据
	if Cfg.Workers == 0 || serverCount == 0 {
		log.Fatal("\x1b[31m没有有效数据,程序退出\x1b[0m")
	}

	// 初始化测试结果
	RetData = make(map[string]jsonResult, serverCount)
	var mu sync.Mutex // 添加互斥锁

	// 生成0到1之间的随机小数，保留两位小数
	randomGenerator := rand.New(rand.NewSource(nowTime.UnixNano()))
	randomNum := Round(randomGenerator.Float64(), 2)

	// 单线程测试
	if Cfg.Workers == 1 {
		for _, server := range Servers {
			output := runDnspyre(GeoDB, Cfg.PreferIPv4, Cfg.NoAAAARecord, DnspyreBinPath, server, DomainsBinPath, Cfg.Duration, Cfg.Concurrency, randomNum)
			RetData[server] = output
		}
	} else {
		// 多线程测试,使用 Cfg.Workers 控制一次最多开启的线程数
		var wg sync.WaitGroup
		semaphore := make(chan struct{}, Cfg.Workers)

		for _, server := range Servers {
			wg.Add(1)
			semaphore <- struct{}{}
			go func(srv string) {
				defer wg.Done()
				defer func() { <-semaphore }()
				output := runDnspyre(GeoDB, Cfg.PreferIPv4, Cfg.NoAAAARecord, DnspyreBinPath, srv, DomainsBinPath, Cfg.Duration, Cfg.Concurrency, randomNum)
				mu.Lock() // 加锁
				RetData[srv] = output
				mu.Unlock() // 解锁
			}(server)
		}

		wg.Wait()
	}

	log.Info("测试完成")
	// log.Info("测试结果: ", RetData)

	// 将测试结果转换为 JSON 字符串
	retDataString, err := RetData.String()
	if err != nil {
		log.WithFields(log.Fields{
			"错误": err,
		}).Fatal("\x1b[31m无法将测试结果转换为 JSON 字符串\x1b[0m")
	}

	if Cfg.OldIsToHTML {
		OutputHTML(OutputPath, retDataString)
	}

	// 输出 JSON 文件
	_, err = OutputFile.WriteString(retDataString)
	if err != nil {
		log.WithFields(log.Fields{
			"错误":   err,
			"输出文件": OutputPath,
		}).Fatal("\x1b[31m无法写出结果到输出文件\x1b[0m")
	}
	log.WithFields(log.Fields{
		"输出文件": OutputPath,
	}).Info("\x1b[32m测试结果已输出到文件\x1b[0m")

	// 是否打开网页分析数据
	if confirmPrompt("是否使用默认浏览器打开可视化数据分析网站[Y/n] ") {
		err := open.Run("https://bench.dash.2020818.xyz")
		if err != nil {
			log.WithError(err).Error("无法打开可视化数据分析网站")
		}
	}
}

func OutputHTML(path string, resultString string) {
	htmlFilePath := path[:len(path)-5] + ".html"
	htmlFile, err := os.Create(htmlFilePath)
	if err != nil {
		log.WithFields(log.Fields{
			"错误": err,
		}).Fatal("\x1b[31m无法创建 HTML 文件\x1b[0m")
	}
	defer htmlFile.Close()
	htmlTemplateData, _ := GetTemplateHTML()
	htmlTemplate := strings.Replace(string(htmlTemplateData), TemplateHTMLPlaceholder, resultString, 1)

	_, err = htmlFile.WriteString(htmlTemplate)
	if err != nil {
		log.WithFields(log.Fields{
			"错误":   err,
			"输出文件": path,
		}).Fatal("\x1b[31m无法写入输出文件\x1b[0m")
	}
	log.WithFields(log.Fields{
		"输出文件": path,
	}).Info("\x1b[32m测试结果已输出到文件\x1b[0m")

	if confirmPrompt("是否使用默认浏览器打开 HTML 输出的文件[Y/n] ") {
		err := open.Run(htmlFilePath)
		if err != nil {
			log.WithError(err).Error("无法打开输出文件")
		}
	}
}
