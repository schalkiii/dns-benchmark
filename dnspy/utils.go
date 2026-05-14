package main

import (
	"bufio"
	"bytes"
	"fmt"
	"math"
	"os"
	"strings"
)

func FormatListFile(path string) ([]string, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("读取文件失败: %w", err)
	}
	return FormatListData(&data)
}

func FormatListData(data *[]byte) ([]string, error) {
	lines := make([]string, 0, 100)
	scanner := bufio.NewScanner(bytes.NewReader(*data))
	scanner.Buffer(make([]byte, 4096), 1048576)

	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line != "" && !strings.HasPrefix(line, "#") {
			lines = append(lines, line)
		}
	}

	if err := scanner.Err(); err != nil {
		return nil, fmt.Errorf("扫描数据失败: %w", err)
	}

	return lines, nil
}

func Round(x float64, precision int) float64 {
	scale := math.Pow10(precision)
	return math.Round(x*scale) / scale
}

func confirmPrompt(prompt string) bool {
	fmt.Print(prompt)
	var input string
	fmt.Scanln(&input)
	return input == "Y" || input == "y" || input == ""
}
