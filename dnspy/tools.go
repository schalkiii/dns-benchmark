package main

import (
	"bufio"
	"os"
	"strings"

	"github.com/oschwald/geoip2-golang"
	log "github.com/sirupsen/logrus"
)

func AloneFunc_GenSampleServersIPCode(geoDB *geoip2.Reader, rawFilePath, outFilePath string) {
	inputFile, err := os.Open(rawFilePath)
	if err != nil {
		log.WithFields(log.Fields{"错误": err}).Fatal("无法打开输入文件")
	}
	defer inputFile.Close()

	outputFile, err := os.Create(outFilePath)
	if err != nil {
		log.WithFields(log.Fields{"错误": err}).Fatal("无法创建输出文件")
	}
	defer outputFile.Close()

	scanner := bufio.NewScanner(inputFile)
	writer := bufio.NewWriter(outputFile)

	for scanner.Scan() {
		line := scanner.Text()
		if strings.HasPrefix(line, "#") {
			continue
		}
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		ip, code, _ := CheckGeo(geoDB, line, true)
		if _, err := writer.WriteString(line + "," + ip + "," + code + ";"); err != nil {
			log.WithFields(log.Fields{"错误": err}).Fatal("写入输出文件时发生错误")
		}
	}

	if err := scanner.Err(); err != nil {
		log.WithFields(log.Fields{"错误": err}).Fatal("读取输入文件时发生错误")
	}

	writer.Flush()
}
