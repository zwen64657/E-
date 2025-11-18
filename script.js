// 全局变量
let currentPage = 0;
let totalPages = 1;
let pagesContent = [];

// DOM元素
const worksheet = document.getElementById('worksheet');
const textContent = document.getElementById('textContent');

// 页面设置元素
const marginTop = document.getElementById('marginTop');
const marginBottom = document.getElementById('marginBottom');
const marginLeft = document.getElementById('marginLeft');
const marginRight = document.getElementById('marginRight');
const marginTopValue = document.getElementById('marginTopValue');
const marginBottomValue = document.getElementById('marginBottomValue');
const marginLeftValue = document.getElementById('marginLeftValue');
const marginRightValue = document.getElementById('marginRightValue');

// 线条设置元素
const lineType = document.getElementById('lineType');
const lineColor = document.getElementById('lineColor');
const lineWidth = document.getElementById('lineWidth');
const lineHeight = document.getElementById('lineHeight');
const lineWidthValue = document.getElementById('lineWidthValue');
const lineHeightValue = document.getElementById('lineHeightValue');

// 文字设置元素
const fontFamily = document.getElementById('fontFamily');
const fontSize = document.getElementById('fontSize');
const textColor = document.getElementById('textColor');
const textAlign = document.getElementById('textAlign');
const fontSizeValue = document.getElementById('fontSizeValue');

// 导航元素
const prevPage = document.getElementById('prevPage');
const nextPage = document.getElementById('nextPage');
const currentPageSpan = document.getElementById('currentPage');
const totalPagesSpan = document.getElementById('totalPages');

// 导出按钮和重置按钮
const exportPdf = document.getElementById('exportPdf');
const resetButton = document.getElementById('resetButton');

// 检查字体支持
function checkFontSupport(fontFamily) {
    try {
        const testText = 'ĉĝĥĵŝŭ';
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 测试指定字体
        ctx.font = '24px ' + fontFamily;
        const width1 = ctx.measureText(testText).width;
        
        // 测试默认字体
        ctx.font = '24px Arial';
        const width2 = ctx.measureText(testText).width;
        
        // 如果宽度差异很小，说明可能不支持特殊字符
        if (Math.abs(width1 - width2) < 5) {
            const warningElement = document.getElementById('font-warning');
            if (warningElement) {
                warningElement.style.display = 'block';
            }
        } else {
            const warningElement = document.getElementById('font-warning');
            if (warningElement) {
                warningElement.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('检查字体支持时发生错误:', error);
    }
}

// 文本分页函数
function paginateText(text, maxWidth, settings) {
    // 按段落分割文本
    const paragraphs = text.split('\n');
    const pages = [];
    let currentPageLines = [];
    
    // 计算每页可容纳的行数
    const pageHeight = 1169;
    const usableHeight = pageHeight - parseInt(marginTop.value) - parseInt(marginBottom.value);
    const linesPerPage = Math.floor(usableHeight / parseInt(lineHeight.value));
    
    // 创建临时 canvas 测量文本宽度
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = `${settings.fontSize}px ${settings.fontFamily}`;
    
    for (const paragraph of paragraphs) {
        // 处理空行 - 直接添加空字符串到结果中
        if (paragraph === '') {
            currentPageLines.push('');
            
            // 检查是否需要分页
            if (currentPageLines.length >= linesPerPage) {
                pages.push([...currentPageLines]);
                currentPageLines = [];
            }
            continue;
        }
        
        // 对于每个段落，按字符逐个检查是否需要换行
        let currentLine = '';
        
        for (let i = 0; i < paragraph.length; i++) {
            const char = paragraph[i];
            const testLine = currentLine + char;
            const testWidth = ctx.measureText(testLine).width;
            
            // 如果加上新字符后超出了最大宽度，则换行
            if (testWidth > maxWidth && currentLine !== '') {
                currentPageLines.push(currentLine);
                currentLine = char;
                
                // 检查是否需要分页
                if (currentPageLines.length >= linesPerPage) {
                    pages.push([...currentPageLines]);
                    currentPageLines = [];
                }
            } else {
                currentLine = testLine;
            }
        }
        
        // 添加最后一行（如果有的话）
        if (currentLine) {
            currentPageLines.push(currentLine);
            
            // 检查是否需要分页
            if (currentPageLines.length >= linesPerPage) {
                pages.push([...currentPageLines]);
                currentPageLines = [];
            }
        }
    }
    
    // 添加最后一页（如果有剩余内容）
    if (currentPageLines.length > 0) {
        pages.push(currentPageLines);
    }
    
    // 如果没有内容，至少创建一个空页
    if (pages.length === 0) {
        pages.push(['']);
    }
    
    return pages;
}

// 显示指定页面
function showPage(pageIndex) {
    // 清空容器
    while (worksheet.firstChild) {
        worksheet.removeChild(worksheet.firstChild);
    }
    
    // 获取设置值
    const settings = {
        marginTop: parseInt(marginTop.value),
        marginBottom: parseInt(marginBottom.value),
        marginLeft: parseInt(marginLeft.value),
        marginRight: parseInt(marginRight.value),
        lineType: lineType.value,
        lineColor: lineColor.value,
        lineWidth: parseInt(lineWidth.value),
        lineHeight: parseInt(lineHeight.value),
        fontFamily: fontFamily.value,
        fontSize: parseInt(fontSize.value),
        textColor: textColor.value,
        textAlign: textAlign.value
    };
    
    // 创建SVG元素
    const pageWidth = 827;
    const pageHeight = 1169;
    
    // 添加背景
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute('fill', 'white');
    worksheet.appendChild(background);
    
    // 绘制行线
    const usableHeight = pageHeight - settings.marginTop - settings.marginBottom;
    const linesPerPage = Math.floor(usableHeight / settings.lineHeight);
    
    for (let i = 0; i < linesPerPage; i++) {
        const y = settings.marginTop + i * settings.lineHeight + settings.lineHeight;
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', settings.marginLeft);
        line.setAttribute('y1', y);
        line.setAttribute('x2', pageWidth - settings.marginRight);
        line.setAttribute('y2', y);
        line.setAttribute('stroke', settings.lineColor);
        line.setAttribute('stroke-width', settings.lineWidth);
        line.setAttribute('stroke-dasharray', getStrokeDashArray(settings.lineType));
        
        worksheet.appendChild(line);
    }
    
    // 绘制文本
    if (pagesContent[pageIndex]) {
        pagesContent[pageIndex].forEach((lineText, index) => {
            const y = settings.marginTop + index * settings.lineHeight + settings.lineHeight * 0.7;
            
            const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            textElement.setAttribute('x', getTextXPosition(settings));
            textElement.setAttribute('y', y);
            textElement.setAttribute('font-family', settings.fontFamily);
            textElement.setAttribute('font-size', settings.fontSize);
            textElement.setAttribute('fill', settings.textColor);
            textElement.setAttribute('text-anchor', getTextAnchor(settings.textAlign));
            textElement.setAttribute('font-style', 'italic');
            textElement.textContent = lineText;
            
            worksheet.appendChild(textElement);
        });
    }
    
    // 更新当前页码显示
    currentPageSpan.textContent = pageIndex + 1;
    
    // 更新导航按钮状态
    updateNavigationButtons();
}

// 获取线条类型对应的stroke-dasharray值
function getStrokeDashArray(type) {
    switch(type) {
        case 'dashed':
            return '10,5';
        case 'dotted':
            return '2,5';
        default:
            return 'none';
    }
}

// 根据对齐方式获取文本锚点
function getTextAnchor(align) {
    switch(align) {
        case 'center':
            return 'middle';
        case 'right':
            return 'end';
        default:
            return 'start';
    }
}

// 根据对齐方式获取文本X坐标
function getTextXPosition(settings) {
    switch(settings.textAlign) {
        case 'center':
            return settings.marginLeft + (827 - settings.marginLeft - settings.marginRight) / 2;
        case 'right':
            return 827 - settings.marginRight;
        default:
            return settings.marginLeft;
    }
}

// 更新导航按钮状态
function updateNavigationButtons() {
    prevPage.disabled = currentPage <= 0;
    nextPage.disabled = currentPage >= totalPages - 1;
}

// 更新分页控件
function updatePaginationControls() {
    prevPage.disabled = currentPage <= 0;
    nextPage.disabled = currentPage >= totalPages - 1;
}

// 显示上一页
function showPrevPage() {
    changePage(-1);
}

// 显示下一页
function showNextPage() {
    changePage(1);
}

// 导出为PDF
function exportToPdf() {
    // 检查是否加载了必要的库
    const hasJsPDF = typeof jspdf !== 'undefined' || (typeof window !== 'undefined' && typeof window.jspdf !== 'undefined');
    const hasHtml2Canvas = typeof html2canvas !== 'undefined' || (typeof window !== 'undefined' && typeof window.html2canvas !== 'undefined');
    
    if (!hasJsPDF || !hasHtml2Canvas) {
        // 如果库未加载，使用基础的打印功能
        if (confirm('PDF导出库未加载，将使用浏览器打印功能。是否继续？')) {
            window.print();
        }
        return;
    }
    
    const jsPDF = (typeof jspdf !== 'undefined') ? jspdf.jsPDF : window.jspdf.jsPDF;
    
    // 创建一个临时容器来放置所有页面
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '-9999px';
    tempContainer.style.width = '827px';
    document.body.appendChild(tempContainer);
    
    // 获取当前设置
    const settings = {
        marginTop: parseInt(marginTop.value),
        marginBottom: parseInt(marginBottom.value),
        marginLeft: parseInt(marginLeft.value),
        marginRight: parseInt(marginRight.value),
        lineType: lineType.value,
        lineColor: lineColor.value,
        lineWidth: parseInt(lineWidth.value),
        lineHeight: parseInt(lineHeight.value),
        fontFamily: fontFamily.value,
        fontSize: parseInt(fontSize.value),
        textColor: textColor.value,
        textAlign: textAlign.value
    };
    
    // 为每一页创建SVG并添加到临时容器
    const renderPromises = [];
    for (let i = 0; i < totalPages; i++) {
        const pageDiv = document.createElement('div');
        pageDiv.style.pageBreakAfter = 'always';
        pageDiv.style.marginBottom = '20px';
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '827');
        svg.setAttribute('height', '1169');
        svg.setAttribute('viewBox', '0 0 827 1169');
        
        // 添加背景
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('width', '100%');
        background.setAttribute('height', '100%');
        background.setAttribute('fill', 'white');
        svg.appendChild(background);
        
        // 绘制行线
        const usableHeight = 1169 - settings.marginTop - settings.marginBottom;
        const linesPerPage = Math.floor(usableHeight / settings.lineHeight);
        
        for (let j = 0; j < linesPerPage; j++) {
            const y = settings.marginTop + j * settings.lineHeight + settings.lineHeight;
            
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', settings.marginLeft);
            line.setAttribute('y1', y);
            line.setAttribute('x2', 827 - settings.marginRight);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', settings.lineColor);
            line.setAttribute('stroke-width', settings.lineWidth);
            line.setAttribute('stroke-dasharray', getStrokeDashArray(settings.lineType));
            
            svg.appendChild(line);
        }
        
        // 绘制文本
        if (pagesContent[i]) {
            pagesContent[i].forEach((lineText, index) => {
                const y = settings.marginTop + index * settings.lineHeight + settings.lineHeight * 0.7;
                
                const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                textElement.setAttribute('x', getTextXPosition(settings));
                textElement.setAttribute('y', y);
                textElement.setAttribute('font-family', settings.fontFamily);
                textElement.setAttribute('font-size', settings.fontSize);
                textElement.setAttribute('fill', settings.textColor);
                textElement.setAttribute('text-anchor', getTextAnchor(settings.textAlign));
                textElement.setAttribute('font-style', 'italic');
                textElement.textContent = lineText;
                
                svg.appendChild(textElement);
            });
        }
        
        pageDiv.appendChild(svg);
        tempContainer.appendChild(pageDiv);
    }
    
    // 使用html2canvas将SVG转换为图片，然后添加到PDF
    setTimeout(() => {
        const pageElements = tempContainer.querySelectorAll('div');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'px',
            format: [827, 1169]
        });
        
        const addPageToPdf = (index) => {
            if (index >= pageElements.length) {
                // 保存PDF
                pdf.save('世界语字帖.pdf');
                // 清理临时容器
                document.body.removeChild(tempContainer);
                return;
            }
            
            const pageElement = pageElements[index];
            const html2canvasLib = (typeof html2canvas !== 'undefined') ? html2canvas : window.html2canvas;
            
            html2canvasLib(pageElement, {
                scale: 2, // 提高图像质量
                useCORS: true,
                backgroundColor: '#ffffff'
            }).then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                if (index > 0) {
                    pdf.addPage();
                }
                pdf.addImage(imgData, 'PNG', 0, 0, 827, 1169);
                addPageToPdf(index + 1);
            }).catch(err => {
                console.error('导出PDF时发生错误:', err);
                alert('导出PDF时发生错误，请重试。');
                document.body.removeChild(tempContainer);
            });
        };
        
        addPageToPdf(0);
    }, 100);
}

// 默认设置
const defaultSettings = {
    // 页面设置
    marginTop: 50,
    marginBottom: 50,
    marginLeft: 50,
    marginRight: 50,
    
    // 线条设置
    lineType: 'solid',
    lineColor: '#999999',
    lineWidth: 1,
    lineHeight: 40,
    
    // 文字设置
    fontFamily: 'Calibri, sans-serif',
    fontSize: 20,
    textColor: '#000000',
    textAlign: 'left',
    
    // 内容设置
    content: 'Saluton mondo! Ĉi tio estas ekzemplo de esperanta teksto por la lernantoj skribi. Mi esperas, ke vi povos lerni Esperanton facile kaj amuze! Bonan ŝancon!\n\n世界语(Esperanto)是一种国际辅助语言，由波兰医生柴门霍夫博士(L. L. Zamenhof)于1887年创立。'
};

// 重置所有设置为默认值
function resetSettings() {
    // 重置页面设置
    marginTop.value = defaultSettings.marginTop;
    marginBottom.value = defaultSettings.marginBottom;
    marginLeft.value = defaultSettings.marginLeft;
    marginRight.value = defaultSettings.marginRight;
    
    // 重置线条设置
    lineType.value = defaultSettings.lineType;
    lineColor.value = defaultSettings.lineColor;
    lineWidth.value = defaultSettings.lineWidth;
    lineHeight.value = defaultSettings.lineHeight;
    
    // 重置文字设置
    fontFamily.value = defaultSettings.fontFamily;
    fontSize.value = defaultSettings.fontSize;
    textColor.value = defaultSettings.textColor;
    textAlign.value = defaultSettings.textAlign;
    
    // 重置内容设置
    textContent.value = defaultSettings.content;
    
    // 更新显示值
    updateValueDisplays();
    
    // 重新生成字帖
    generateWorksheet();
}

// 初始化事件监听器
function initEventListeners() {
    // 页面设置事件
    marginTop.addEventListener('input', function() {
        marginTopValue.textContent = this.value;
        generateWorksheet();
    });
    
    marginBottom.addEventListener('input', function() {
        marginBottomValue.textContent = this.value;
        generateWorksheet();
    });
    
    marginLeft.addEventListener('input', function() {
        marginLeftValue.textContent = this.value;
        generateWorksheet();
    });
    
    marginRight.addEventListener('input', function() {
        marginRightValue.textContent = this.value;
        generateWorksheet();
    });
    
    // 线条设置事件
    lineType.addEventListener('change', generateWorksheet);
    lineColor.addEventListener('input', generateWorksheet);
    lineWidth.addEventListener('input', function() {
        lineWidthValue.textContent = this.value;
        generateWorksheet();
    });
    
    lineHeight.addEventListener('input', function() {
        lineHeightValue.textContent = this.value;
        generateWorksheet();
    });
    
    // 文字设置事件
    fontFamily.addEventListener('change', function() {
        checkFontSupport(this.value);
        generateWorksheet();
    });
    fontSize.addEventListener('input', function() {
        fontSizeValue.textContent = this.value;
        generateWorksheet();
    });
    
    textColor.addEventListener('input', generateWorksheet);
    textAlign.addEventListener('change', generateWorksheet);
    
    // 内容设置事件
    textContent.addEventListener('input', generateWorksheet);
    
    // 导航事件
    prevPage.addEventListener('click', showPrevPage);
    nextPage.addEventListener('click', showNextPage);
    
    // 导出事件
    exportPdf.addEventListener('click', exportToPdf);
    
    // 重置事件
    resetButton.addEventListener('click', resetSettings);
}

// 更新值显示
function updateValueDisplays() {
    marginTopValue.textContent = marginTop.value;
    marginBottomValue.textContent = marginBottom.value;
    marginLeftValue.textContent = marginLeft.value;
    marginRightValue.textContent = marginRight.value;
    lineWidthValue.textContent = lineWidth.value;
    lineHeightValue.textContent = lineHeight.value;
    fontSizeValue.textContent = fontSize.value;
}

// 生成字帖
function generateWorksheet() {
    // 清空容器
    while (worksheet.firstChild) {
        worksheet.removeChild(worksheet.firstChild);
    }
    
    // 获取设置值
    const settings = {
        marginTop: parseInt(marginTop.value),
        marginBottom: parseInt(marginBottom.value),
        marginLeft: parseInt(marginLeft.value),
        marginRight: parseInt(marginRight.value),
        lineType: lineType.value,
        lineColor: lineColor.value,
        lineWidth: parseInt(lineWidth.value),
        lineHeight: parseInt(lineHeight.value),
        fontFamily: fontFamily.value,
        fontSize: parseInt(fontSize.value),
        textColor: textColor.value,
        textAlign: textAlign.value,
        content: textContent.value
    };
    
    // 检查字体支持
    checkFontSupport(settings.fontFamily);
    
    // 计算可用空间
    const pageWidth = 827;
    const pageHeight = 1169;
    const usableWidth = pageWidth - settings.marginLeft - settings.marginRight;
    const usableHeight = pageHeight - settings.marginTop - settings.marginBottom;
    
    // 计算每页可容纳的行数
    const linesPerPage = Math.floor(usableHeight / settings.lineHeight);
    
    // 处理文本换行
    pagesContent = paginateText(settings.content, usableWidth, settings);
    
    // 更新总页数
    totalPages = pagesContent.length;
    totalPagesSpan.textContent = totalPages;
    
    // 显示第一页
    currentPage = 0;
    showPage(currentPage);
    
    // 更新导航按钮状态
    updateNavigationButtons();
}

// 页面切换函数
function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 0 && newPage < totalPages) {
        currentPage = newPage;
        showPage(currentPage);
        updatePaginationControls();
    }
}

// 初始化应用
function init() {
    updateValueDisplays();
    initEventListeners();
    generateWorksheet();
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);