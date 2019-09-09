
const to_query_string = (obj) => {
    return obj ? Object.keys(obj).sort().map((key) => {
      var val = obj[key];
      if (Array.isArray(val)) {
        return val.sort().map((val2) => {
          return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
        }).join('&');
      }
      return encodeURIComponent(key) + '=' + encodeURIComponent(val);
    }).join('&') : '';
  }

const htmlspecialchars_decode = (string, quote_style) => {
    //       discuss at: http://phpjs.org/functions/htmlspecialchars_decode/
    //      original by: Mirek Slugen
    //      improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    //      bugfixed by: Mateusz "loonquawl" Zalega
    //      bugfixed by: Onno Marsman
    //      bugfixed by: Brett Zamir (http://brett-zamir.me)
    //      bugfixed by: Brett Zamir (http://brett-zamir.me)
    //         input by: ReverseSyntax
    //         input by: Slawomir Kaniecki
    //         input by: Scott Cariss
    //         input by: Francois
    //         input by: Ratheous
    //         input by: Mailfaker (http://www.weedem.fr/)
    //       revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // reimplemented by: Brett Zamir (http://brett-zamir.me)
    //        example 1: htmlspecialchars_decode("<p>this -&gt; &quot;</p>", 'ENT_NOQUOTES');
    //        returns 1: '<p>this -> &quot;</p>'
    //        example 2: htmlspecialchars_decode("&amp;quot;");
    //        returns 2: '&quot;'

    var optTemp = 0,
      i = 0,
      noquotes = false;
    if (typeof quote_style === 'undefined') {
      quote_style = 2;
    }
    string = string.toString()
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    var OPTS = {
      'ENT_NOQUOTES': 0,
      'ENT_HTML_QUOTE_SINGLE': 1,
      'ENT_HTML_QUOTE_DOUBLE': 2,
      'ENT_COMPAT': 2,
      'ENT_QUOTES': 3,
      'ENT_IGNORE': 4
    };
    if (quote_style === 0) {
      noquotes = true;
    }
    if (typeof quote_style !== 'number') {
      // Allow for a single string or an array of string flags
      quote_style = [].concat(quote_style);
      for (i = 0; i < quote_style.length; i++) {
        // Resolve string input to bitwise e.g. 'PATHINFO_EXTENSION' becomes 4
        if (OPTS[quote_style[i]] === 0) {
          noquotes = true;
        } else if (OPTS[quote_style[i]]) {
          optTemp = optTemp | OPTS[quote_style[i]];
        }
      }
      quote_style = optTemp;
    }
    if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
      string = string.replace(/&#0*39;/g, "'"); // PHP doesn't currently escape if more than one 0, but it should
      // string = string.replace(/&apos;|&#x0*27;/g, "'"); // This would also be useful here, but not a part of PHP
    }
    if (!noquotes) {
      string = string.replace(/&quot;/g, '"');
    }
    // Put this in last place to avoid escape being double-decoded
    string = string.replace(/&amp;/g, '&');

    return string;
}

class InitTable extends React.Component {
    constructor(props) {
        super(props);
        var nowTime = new Date().getTime();
        this.state = {
            sourceData: this.readTextFile("../db/my_data.csv?v=" + nowTime),
            modalId: 0,
            modalType: '',
            modalTitle: '',
            modalTag: '',
            modalContent: '',
            showModal: false
        };
        this.handleOpenModal = this.handleOpenModal.bind(this);
        this.handleCloseModal = this.handleCloseModal.bind(this);
    }

    // 開啟視窗
    handleOpenModal (id, type, title, tag, content) {
        this.setState({
            modalId: id,
            modalType: type,
            modalTitle: title,
            modalTag: tag,
            modalContent: htmlspecialchars_decode(content),
            showModal: true
        });
    }

    // 關閉視窗
    handleCloseModal () {
        this.setState({ showModal: false });
    }

    // 讀取ＣＳＶ
    readTextFile = file => {
        var result = '';
		var rawFile = new XMLHttpRequest();
		rawFile.open("GET", file, false);
		rawFile.onreadystatechange = () => {
			if (rawFile.readyState === 4) {
				if (rawFile.status === 200 || rawFile.status == 0) {
                    result = rawFile.responseText;
                    Papa.parse(rawFile.responseText, {
                        delimiter: ",",
                        newline: "",
                        quoteChar: '"',
                        complete: (results) => {
                            result = results;
                        }
                    });
				}
			}
		};
        rawFile.send(null);
        return result;
    };

    // 初始化表格
    initTable = (list) => {
        var keyword = this.props.keyword;
        var trArray = [];
        list.map((row, i) => {
            var td1Css = {
                style: {
                    'width': '30%',
                    'border':  '1px solid'
                }
            };
            var td2Css = {
                style: {
                    'width': '70%',
                    'border':  '1px solid'
                }
            };
            var functionName = <a href="javascript:void(0);" onClick={() => this.handleOpenModal(row[0], row[1], row[2], row[3], row[4])}>{row[2]}</a>;
            var matcher = new RegExp(keyword, 'gi');
            if (keyword == '' || matcher.test(row[1]) || matcher.test(row[2]) || matcher.test(row[3])) {
                trArray.push(<tr key={i}><td {...td1Css}>{row[1]}</td><td {...td2Css}>{functionName}</td></tr>);
            }
        });
        return trArray;
    }

    // 編輯事件
    editEvent = () => {
        if (this.state.modalType == '' || this.state.modalTitle == '') {
            alert('語言或功能名稱為必須項目。');
        } else {
            fetch('./edit.php', {
                method: 'POST',
                credentials: 'same-origin',
                mode: 'same-origin',
                headers: {
                    'Accept':       'application/x-www-form-urlencoded',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: to_query_string({
                    id: this.state.modalId,
                    type: this.state.modalType,
                    title: this.state.modalTitle,
                    tag: this.state.modalTag,
                    content: this.state.modalContent,
                })
            }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.Result == 'SUCCESS') {
                    console.log('資料更新成功');
                    var nowTime = new Date().getTime();
                    this.setState({
                        sourceData: this.readTextFile("../db/my_data.csv?v=" + nowTime),
                        showModal: false
                    });
                } else {
                    console.log('資料更新失敗');
                }
            })
            .catch((error) => {
                console.error(error);
            });
        }
    }

    // 編輯事件
    deleteEvent = () => {
        if (confirm("你確定要刪除嗎？")) {
            fetch('./delete.php', {
                method: 'POST',
                credentials: 'same-origin',
                mode: 'same-origin',
                headers: {
                    'Accept':       'application/x-www-form-urlencoded',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: to_query_string({
                    id: this.state.modalId
                })
            }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.Result == 'SUCCESS') {
                    console.log('資料刪除成功');
                    var nowTime = new Date().getTime();
                    this.setState({
                        sourceData: this.readTextFile("../db/my_data.csv?v=" + nowTime),
                        showModal: false
                    });
                } else {
                    console.log('資料刪除失敗');
                }
            })
            .catch((error) => {
                console.error(error);
            });
        }
    }

    // 載入component時
    componentWillMount() {
        ReactModal.setAppElement('body');
    }

    // 更新component時
    shouldComponentUpdate(nextProps, nextState) {
        return (!(this.props.keyword === nextProps.keyword) || this.state.showModal != nextState.showModal);
    }

    // 渲染
    render() {
        var tableAttr = {
            style: {
                width: '100%',
                borderCollapse: 'collapse'
            }
        };
        var textareaAttr = {
            rows: 30,
            style: {
                width: '100%',
                height: '100%',
            }
        };
        var btnAttr = {
            style: {
                textAlign: 'center'
            }
        };
        var closeBtnAttr = {
            style: {
                float: 'right'
            }
        };
        var table = <table {...tableAttr}><tbody>{this.initTable(this.state.sourceData.data)}</tbody></table>;
        return (
            <div>
                {table}
                <ReactModal
                    isOpen={this.state.showModal}
                    contentLabel="Minimal Modal Example"
                >
                    <div>
                        <button {...closeBtnAttr} onClick={this.handleCloseModal}>x</button>
                        <label>語言：</label>
                        <input {...textareaAttr} defaultValue={this.state.modalType} onChange={(e) => {this.setState({modalType: e.target.value})}}/>
                        <label>功能名稱：</label>
                        <input {...textareaAttr} defaultValue={this.state.modalTitle} onChange={(e) => {this.setState({modalTitle: e.target.value})}}/>
                        <br/>
                        <label>關鍵字：</label>
                        <input {...textareaAttr} defaultValue={this.state.modalTag} onChange={(e) => {this.setState({modalTag: e.target.value})}}/>
                        <br/>
                        <label>內容：</label>
                        <br/>
                        <textarea {...textareaAttr} defaultValue={this.state.modalContent} onChange={(e) => {this.setState({modalContent: e.target.value})}}></textarea>
                        <br/>
                        <div {...btnAttr}>
                            <button onClick={this.editEvent}>保存</button>
                            &nbsp;
                            <button onClick={this.handleCloseModal}>關閉視窗</button>
                            &nbsp;
                            <button {...closeBtnAttr} onClick={this.deleteEvent}>刪除</button>
                        </div>
                    </div>
                </ReactModal>
            </div>
        );
    }
}

class InitSearchHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            keyword: '',
            renderCnt: 0,
            showModal: false,
            postType: '',
            postTitle: '',
            postTag: '',
            postContent: ''
        };
    }
    // 開啟視窗
    handleOpenInsertModal () {
        this.setState({
            showModal: true
        });
    }

    // 關閉視窗
    handleCloseInsertModal () {
        this.setState({ showModal: false });
    }

    changeKeyword = (e) => {
        this.setState({
            keyword: e.target.value
        });
    }
    searchEvent = () => {
        this.setState({
            renderCnt: (this.state.renderCnt + 1)
        });
    }

    insertEvent = () => {
        if (this.state.postType == '' || this.state.postTitle == '') {
            alert('語言或功能名稱為必須項目。');
        } else {
            fetch('./insert.php', {
                method: 'POST',
                credentials: 'same-origin',
                mode: 'same-origin',
                headers: {
                    'Accept':       'application/x-www-form-urlencoded',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: to_query_string({
                    type: this.state.postType,
                    title: this.state.postTitle,
                    tag: this.state.postTag,
                    content: this.state.postContent,
                })
            }).then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.Result == 'SUCCESS') {
                    console.log('資料新增成功');
                    location.reload();
                } else {
                    console.log('資料插入失敗');
                }
            })
            .catch((error) => {
                console.error(error);
            });
        }
    }

    // 載入component時
    componentWillMount() {
        ReactModal.setAppElement('body');
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (!(this.state.renderCnt === nextState.renderCnt) || this.state.showModal != nextState.showModal);
    }
    render() {
        var inputAttr = {
            placeholder: 'Enter a keyword',
            type: 'url',
            autoFocus: true,
            style: {
                width: '50%'
            },
            onChange: this.changeKeyword,
            onKeyDown: (e) => {
                var ENTER = 13;
                if (e.keyCode == ENTER) {
                    this.searchEvent();
                }
            }
        };
        this.searchInput = React.createElement(
            "input",
            inputAttr
        );
        this.searchBtn = React.createElement(
            "button",
            {
                onClick: this.searchEvent
            },
            'Search'
        );
        this.insertBtn = React.createElement(
            "button",
            {
                onClick: () => {this.handleOpenInsertModal()}
            },
            'Insert'
        );
        var headerAttr = {
            style: {
                position: 'fixed',
                width: '100%',
                background: 'gray',
                paddingTop: '10px',
                paddingBottom: '10px'
            }
        }
        var contentAttr = {
            style: {
                paddingTop: '50px'
            }
        };
        var btnAttr = {
            style: {
                textAlign: 'center'
            }
        };
        var closeBtnAttr = {
            style: {
                float: 'right'
            }
        };
        this.typeInput = React.createElement(
            "input",
            {
                onChange: (e) => {
                    this.setState(
                        {
                            postType: e.target.value
                        }
                    )
                },
                style: {
                    width: '100%',
                    height: '100%',
                }
            }
        );
        this.titleInput = React.createElement(
            "input",
            {
                onChange: (e) => {
                    this.setState(
                        {
                            postTitle: e.target.value
                        }
                    )
                },
                style: {
                    width: '100%',
                    height: '100%',
                }
            }
        );
        this.tagInput = React.createElement(
            "input",
            {
                onChange: (e) => {
                    this.setState(
                        {
                            postTag: e.target.value
                        }
                    )
                },
                style: {
                    width: '100%',
                    height: '100%',
                }
            }
        );
        this.contentTextArea = React.createElement(
            "textarea",
            {
                onChange: (e) => {
                    this.setState(
                        {
                            postContent: e.target.value
                        }
                    )
                },
                rows: 30,
                style: {
                    width: '100%',
                    height: '100%',
                }
            }
        );
        this.myTable = React.createElement(InitTable, {keyword: this.state.keyword});
        return (
            <div>
                <div {...headerAttr}>{this.searchInput}{this.searchBtn}{this.insertBtn}</div>
                <div {...contentAttr}>{this.myTable}</div>
                <ReactModal
                    isOpen={this.state.showModal}
                    contentLabel="Minimal Modal Example"
                >
                    <div>
                        <button {...closeBtnAttr} onClick={() => this.handleCloseInsertModal()}>x</button>
                        <label>語言：</label>
                        {this.typeInput}
                        <label>功能名稱：</label>
                        {this.titleInput}
                        <br/>
                        <label>關鍵字：</label>
                        {this.tagInput}
                        <br/>
                        <label>內容：</label>
                        <br/>
                        {this.contentTextArea}
                        <br/>
                        <div {...btnAttr}>
                            <button onClick={this.insertEvent}>新增</button>
                            <button onClick={() => this.handleCloseInsertModal()}>關閉視窗</button>
                        </div>
                    </div>
                </ReactModal>
            </div>
        );
    }
}

ReactDOM.render(
    React.createElement(InitSearchHeader),
    document.getElementById('container')
);