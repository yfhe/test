//(function(win, doc){
  var win = window;
  var doc = document;
  
  var nativeApi = {
    checkDepend: function(){
      if(win.TcsJSBridge){
        //console.log('TcsJSBridge ready!');
        return true;
      }
      console.log('TcsJSBridge not ready!');
      return false;
    },
    commonCallback: function(callFunc, res){
      win.log && win.log("err_msg: " + res.err_msg + " ret: " + res.ret);
      callFunc && callFunc(res);
    },
    sendMsg: function(callback){
      TcsJSBridge.invoke("sendMessage", {
          info_type : "send_message", 
          info_value : {'key_sms_number':'1069070069','key_sms_content': '配置邮箱客户端'},
          plugin_id: 293,
          custom_brocast:false,
        }, this.commonCallback.bind(this, callback));
    },
    getVerifyMsg: function(){
      TcsJSBridge.invoke("sendMessage", {
            info_type : "get_sms_captcha", 
            info_value : param,
            plugin_id: 293,
            custom_brocast:false,
          }, this.commonCallback.bind(this, callback));
    },
    sendEmailRequest: function(param, callback) {
        TcsJSBridge.invoke("sendMessage", {
            info_type : "common_request", 
            info_value : param,
            plugin_id: 293,
            custom_brocast:false,
          }, this.commonCallback.bind(this, callback));
    },
    setCache: function(obj, callback){
      this.checkDepend() && TcsJSBridge.invoke("sendMessage", {
          info_type : "set_memory_cookie", 
          info_value : obj,
          plugin_id: 293,
          custom_brocast:false,
        }, this.commonCallback.bind(this, callback));
    },
    getCache: function(callback){
      this.checkDepend() && TcsJSBridge.invoke("sendMessage", {
          info_type : "get_memory_cookie", 
          info_value : '',
          plugin_id: 293,
          custom_brocast:false,
        }, this.commonCallback.bind(this, callback));
    },
    showCover: function(callback){
      this.checkDepend() && TcsJSBridge.invoke("sendMessage", {
          info_type : "show_mask_layer", 
          info_value : '',
          plugin_id: 293,
          custom_brocast:false,
        }, this.commonCallback.bind(this, callback));
    },
    hideCover: function(callback){
      this.checkDepend() && TcsJSBridge.invoke("sendMessage", {
          info_type : "dismiss_mask_layer", 
          info_value : '',
          plugin_id: 293,
          custom_brocast:false,
        }, this.commonCallback.bind(this, callback));
    }
  };

  var _debug = false;

  var payListControl = {
    init: function(type){
      debugger;
      switch(type){
        case 'done':

        break;
        case 'ignore':
        break;
      }
    },
  }

  var loginControl = {
    //curPlatform: 'other',
    redirectMap: null,
    loopInterval: 500,
    maxLoop: 30,
    retryInterval: 4,
    maxRetry: 5,
    maxRedirect: 3,
    cacheKey: {
      modifyKey: 'lastModify',
      accountInfoCacheKey: 'accountInfo',
      redirectKey: 'redirectNum',
    },
    lastModify: 0,
    platformMap: {
      'qq': /.*qq\.com$/i,
      '163': /.*163\.com$/i,
      '126': /.*126\.com$/i,
      '139': /.*10086\.cn/i,
      'sina': /.*sina(\.com)?\.cn/i,
    },
    keyMap: {
      'account': ['username', 'UserName'],
      'password': ['password', 'passwd', "PassWord"],
      'form': ['#loginForm', '.login-box form']
    },
    getHost: function(){
      if(win.location.host){
        return location.host;
      }else{
        var matcher = location.href.match(/https?::\/\/([a-z\.]+)\//i);
        return matcher && matcher[1];
      }
    },
    getPlatform: function(){
      var curHost = this.getHost();
      if(!curHost){
        return 'other';
      }
      var platform = 'other';
      var platformMap = this.platformMap;
      Object.keys(platformMap).some(function(_platfrom){
        if(platformMap[_platfrom].test(curHost)){
          platform = _platfrom;
          return true;
        }
      });
      return platform;
    },
    prepare: function(){
      var self = this;
      console.log('prepare!');
      if(doc.readyState){
        if(doc.readyState !== 'complete'){
           win.addEventListener('load', function(){
             self.initCache('not complete');
           });
        }else{
          self.initCache('load');
        }
      }else{
        setTimeout(function(){
          self.initCache('timeout');
        },5000);
      }
    },
    initCache: function(from){
      var self = this;
      console.log('last step is:'+ from);
      if(nativeApi.checkDepend()){
        nativeApi.getCache(function(ret){
          //debugger;
          console.log('get cache done! msg:'+ ret.err_msg + '&val:' + ret.ret_value);
          if(ret.err_msg == 'ok' && ret.ret_value && typeof(ret.ret_value) == 'object'){
            localCache._cacheMap = ret.ret_value;
          }
          self.init();
        });
      }else{
        self.init();
      }
    },
    init: function(){
      var self = this;
      var curPlatform = this.curPlatform = this.getPlatform();
      debugger;
      if(!uiIntreface.roles || !uiIntreface.roles.cover){
        uiIntreface.bindUI();
      }
      if(_debug){
        uiIntreface.roles.cover.hide();
      }

      if(curPlatform === 'other'){
        console.log('no support!');
        uiIntreface.hideLoaing();
        return null;
      }
      this.redirectMap = localCache.get(this.cacheKey.redirectKey);

      this.redirectMap = this.redirectMap || {
        form: 0,
        index: 0,
        set: 0,
      };

      //debugger
      for(var i in this.cacheKey){
        if(this.cacheKey.hasOwnProperty(i)){
          self.cacheKey[i] += '_'+curPlatform;
        }
      }
      // try{
      //   Object.keys().forEach(function(key){
      //     self.cacheKey[key] += '_'+curPlatform;
      //   });
      // }catch(err){
      //   console.log(err);
      // }
      

      //var lastStatus = localCache.get(this.cacheKey.statusCacheKey);
      var sid = this.getSid();
      if(sid){
        // var accountInfo = localCache.get(this.cacheKey.accountInfoCacheKey);
        // if(!accountInfo){
        //   console.error('not account info');
        //   //return;
        // }
        var accountInfo = localCache.get(this.cacheKey.accountInfoCacheKey) || {account: 'example@163.com'}
        //uiIntreface.setAccountInfo(accountInfo.account);
        accountInfo.sid = sid;
        // save 
        localCache.set(this.cacheKey.accountInfoCacheKey, accountInfo);
        localCache.set('key_email_account', accountInfo.account);
        nativeApi.checkDepend() && nativeApi.sendEmailRequest(accountInfo);
        
        return payListControl.init('done');
        // if(!this.isSetPage()){
        //   // send sid
        //   return this.gotoSetPage(accountInfo);
        // }
      }

      if(curPlatform == 'sina' && location.pathname == '/mobile/index.php'){
        return this.gotoSetPage();
      }

      // if(this.isSetPage()){
      //   return this.setPop3();
      // }

      this.proxySubmitForm();
    },
    isSetPage: function(){
      isSetPage = false;
      switch(this.curPlatform){
        case 'qq':
          isSetPage = location.pathname == '/cgi-bin/frame_html';
        break;
        case '126':
        case '163':
          isSetPage = location.pathname ==  '/settings/index.jsp';
        break;
        case 'sina':
          isSetPage = location.pathname == '/classic/index.php';
        break;
        case '139':
          isSetPage = location.pathname == '/m2015/html/index.html';
        break;
      }
      return isSetPage;
    },
    gotoSetPage: function(accountInfo){
      var setLink = null;

      var curType = 'index';
      this.curStatus = curType;
      this.redirectMap[curType] ++;
      localCache.set(this.cacheKey.redirectKey, this.redirectMap);
      if(this.redirectMap[curType] > this.maxRedirect){
        return payListControl.init('ignore');
      }

      win.onbeforeunload = '';
      switch(this.curPlatform){
        case 'qq':
          [].some.call(document.querySelectorAll('.qm_footer_links > a'), function(aElem){
            if(aElem.innerText == '标准版'){
              setLink = aElem.href;
              return true;
            }
          });
          
        break;
        case '126':
        case '163':
          //简版邮箱没有设置入口，需要先中转到完整版。
          // var redirectTime = localCache.get(self.cacheKey.redirectKey);
          // if(location.path != '/js6/main.jsp'){
          //   if(redirectTime > self.maxRedirect){
          //     console.log('redirect to many abort!');
          //     return null;
          //   }
          //   localCache.set(self.cacheKey.redirectKey, ++redirectTime);
          //   return location.href='http://'+location.host + '?dv=pc';
          // }
          //this.sid = this.getSid();
          
          //var accountInfo = localCache.get(this.cacheKey.accountInfoCacheKey) || {};
          //accountInfo.sid = this.sid;
          //localCache.set(this.cacheKey.accountInfoCacheKey, accountInfo);
          setLink = 'http://config.mail.'+this.curPlatform+'.com/settings/index.jsp?sid='+this.sid+'&uid='+ (doc.getElementById('spnUid').innerText.replace(/\s/g,'') || accountInfo.account) +'&host=mail.163.com&ver=js6&fontface=none&style=7&skin=skyblue&color=064977';
        break;
        case 'sina':
          setLink = 'http://m0.mail.sina.cn/classic/index.php#title=&action=setting&key=&tabUrl=service&innerTab=0&preset=true';
        break;
        case '139':
          if(location.pathname != '/html/welcome.html'){
            return location.href = 'http://html5.mail.10086.cn/html/welcome.html?sid='+ this.sid;
          }
          [].some.call(document.querySelectorAll('#bottomNav a'), function(elem){
            if(elem.innerText == '电脑版'){
              setLink = elem.href;
            }
          });
          if(!setLink){
            debugger;
            setLink = 'http://appmail.mail.10086.cn/m2015/html/index.html';
          }
        break;
        default:
        break;
      }
      if(setLink){
        location.href = setLink;
      }
    },
    setPop3: function(callback){
      var self = this;
      var accountInfo = localCache.get(this.cacheKey.accountInfoCacheKey);
      var taskQueue = [];
      var curIndex = 0;

      var curType = 'set';
      this.curStatus = curType;
      this.redirectMap[curType] ++;
      localCache.set(this.cacheKey.redirectKey, this.redirectMap);
      if(this.redirectMap[curType] > this.maxRedirect){
        return payListControl.init('ignore');
      }

      function ignoreSet(){
        alert('跳过');
        debugger;
        payListControl.init('ignore');
      }
      function setDone(){
        alert('完成')
        debugger;
        payListControl.init('done');
      }
      switch(this.curPlatform){
        case 'qq':
          taskQueue = [
            {
              checkDepend: function(){
                this.mainFrame = doc.getElementById('mainFrame');
                this.setA = doc.getElementById('frame_html_setting');

                if(this.mainFrame && this.setA){
                  return true;
                }else{
                  return false;
                }
              },
              run: function(next){
                this.mainFrame.src = this.setA.href;
                next && next();
              }
            },
            {
              checkDepend: function(){
                this.mainFrame = doc.getElementById('mainFrame');
                if(this.mainFrame.contentWindow && this.mainFrame.contentWindow.document && this.mainFrame.contentWindow.document.querySelector('.settingSub a')){
                  return true;
                }else{
                  return false;
                }
              },
              run: function(next){
                this.mainFrame.contentWindow.document.querySelectorAll('.settingSub a')[0].click()
                next && next();
              }
            },
            {
              checkDepend: function(){
                this.mainFrame = doc.getElementById('mainFrame');
                if(this.mainFrame.contentWindow && this.mainFrame.contentWindow.openSecurityDialog){
                  return true;
                }else{
                  return false;
                }
              },
              run: function(next){
                //this.mainFrame.contentDocument.domain = 'qq.com';
                top.document.domain = 'qq.com';

                this.mainFrame.contentWindow.window.openSecurityDialog('pop3_smtp', 'PopEsMTP', 1 , 'POP3/SMTP');
                var orgDoneFunc = securityProxyIframeLoad;
                securityProxyIframeLoad = function(){
                  orgDoneFunc && orgDoneFunc();
                  next && next();
                }
                //next && next();
              }
            },
            {
              checkDepend: function(){
                var securityDialog = doc.getElementById('security-dialog_QMDialog_proxyiframe');
                if(securityDialog && securityDialog.contentWindow && securityDialog.contentWindow.document){
                  this.securityDialog = securityDialog;
                  return true;
                }else{
                  return false;
                }
              },
              run: function(next){
                var _self = this;
                // send ems TODO
                console.log('ready send msm');
                uiIntreface.showSendMsgBox(function(fail){
                  console.log('msg send');
                  
                  if(nativeApi.checkDepend()){
                      nativeApi.sendMsg(function(ret){
                      if(ret.err_msg == 'ok'){
                        setTimeout(function(){
                          debugger;
                          win.securityFailCallback = function(){
                            debugger;
                            payListControl.init('ignore');
                          }
                          win.securitySucCallback = function(tit, authCode){
                            accountInfo.authCode = authCode;
                            localCache.set(self.cacheKey.accountInfoCacheKey, accountInfo);
                            nativeApi.sendEmailRequest(accountInfo, function(){
                              payListControl.init('done');
                            });
                          }
                          doc.getElementById('security-dialog_QMDialog_proxyiframe').contentWindow.document.getElementById('fm_proxyFrame').contentWindow.document.querySelector('#verify_btn').click();
                          //top.document.domain = 'mail.qq.com';
                          //next && next();
                        }, 5000);
                      }else{
                        payListControl.init('ignore');
                      }
                    });
                  }else{
                    setTimeout(function(){
                      debugger;
                      win.securityFailCallback = function(){
                        debugger;
                        payListControl.init('ignore');
                      }
                      win.securitySucCallback = function(tit, authCode){
                        accountInfo.authCode = authCode;
                        localCache.set(self.cacheKey.accountInfoCacheKey, accountInfo);
                        nativeApi.sendEmailRequest(accountInfo, function(){
                          payListControl.init('done');
                        });
                      }
                      doc.getElementById('security-dialog_QMDialog_proxyiframe').contentWindow.document.getElementById('fm_proxyFrame').contentWindow.document.querySelector('#verify_btn').click();
                      top.document.domain = 'mail.qq.com';
                      //next && next();
                    }, 5000);
                  }
                  
                  //设置检查延时为1分钟
                  //self.loopInterval = 60000;
                }, ignoreSet);
                // debugger
                //next && next();
              }
            },
            // {
            //   checkDepend: function(){
            //     //ems send done!;
            //     !this.verifyBtn &&(this.verifyBtn = doc.getElementById('security-dialog_QMDialog_proxyiframe').contentWindow.document.getElementById('fm_proxyFrame').contentWindow.document.querySelector('#verify_btn'));

            //     !this.securityCodeDialog && (this.securityCodeDialog = doc.querySelector('#security-dialog_QMDialog__content_ .securePwd_cnt_left_num span'));
                
            //     if(this.securityCodeDialog){
            //       return true;
            //     }else{
            //       return false;
            //     }
            //   },
            //   run: function(next){
            //     this.verifyBtn.click();
            //     accountInfo.authCode = [].map.call(doc.querySelectorAll('#security-dialog_QMDialog__content_ .securePwd_cnt_left_num span'), function(elem){return elem.innerText}).join('');
            //     // save auth code
            //     localCache.set(self.cacheKey.accountInfoCacheKey, accountInfo);
            //     next && next();
            //   }
            // },
            // {
            //   checkDepend: function(){
            //     return true;
            //   },
            //   run: setDone
            // }
          ];
        break;
        case '163':
        case '126':
          //模拟点击，
          taskQueue = [
            {
              checkDepend: function(){  //点击设置 打开设置菜单
                this.popBtn = doc.querySelector('#pop3');
                return this.popBtn ? true : false;
              },
              run: function(next){
                if(this.popBtn.checked == false){
                  this.popBtn.checked = true;
                  checkMobile();
                  next && next();
                }else{
                  return payListControl.init('done');
                }
              }
            },
            {
              checkDepend: function(){
                this.sendCodeBtn = doc.querySelector('#checkMobileDialog .js-fetchbtn');
                return this.sendCodeBtn ? true : false;
              },
              run: function(){
                var self = this;
                this.saveBtn = doc.querySelector('#checkMobileDialog .jq-btn1');
                this.verifyInput = doc.querySelector('#checkMobileDialog .js-vcode');
                var phoneBox = this.phoneBox = doc.querySelector('#checkMobileDialog .nui-form-cont div span')
                if(phoneBox){
                  var phoneNum = phoneBox.innerText;
                  uiIntreface.showVerifyBox(phoneNum, function(){
                    debugger;
                    console.log('send msg');
                    self.sendCodeBtn.click();
                  },function(verifyCode, showErr){
                    console.log('get verifyCode' + verifyCode);
                    debugger;
                    var verifyInput = self.verifyInput;
                    if(verifyInput){
                      verifyInput.value = verifyCode;
                    }
                    self.saveBtn.click();
                    
                    //check status
                  }, ignoreSet);
                }
                // var phoneNum = 
                // this.sendCodeBtn.click();
                // start send ms code 
                
                //next && next();
              }
            },
            {
              checkDepend: function(){
                this.saveBtn = doc.querySelector('#checkMobileDialog .jq-btn1');
              },
              run: function(){
                this.saveBtn.click();
                next && next();
              }
            }
          ]
        break;
        case 'sina':
          taskQueue = [
            {
              checkDepend: function(){
                this.setBtn = doc.querySelector('.paneSet a');
                return this.setBtn ? true: false;
              },
              run: function(next){
                this.setBtn.click();
                next && next();
              }
            },
            {
              checkDepend: function(){
                this.setTab =  doc.querySelectorAll('#setting_tabs a');
                return this.setTab.length > 0 ? true :false;
              },
              run: function(next){
                doc.querySelectorAll('#setting_tabs a')[8].click();
                next && next();
              }
            },
            {
              checkDepend: function(){
                this.setInput = doc.querySelector('.setInputStyle#p1');
                this.saveBtn = doc.querySelector('[_act="service_check"]');
                return this.setInput && this.saveBtn ? true : false;
              },
              run: function(next){
                var self = this;
                if(!this.setInput.checked){
                  this.setInput.checked = true;
                  setTimeout(function(){
                    self.saveBtn.click();
                    next && next();
                  }, 50);
                }else{
                  next && next();
                }
              }
            },
            {
              checkDepend: function(){
                return true;
              },
              run: setDone
            }
          ];
        break;
        case '139':
          taskQueue = [
            {
              checkDepend: function(){
                this.setPageBtn = document.querySelector('[target="account_accountSet"]');
                return this.setPageBtn ? true : false;
              },
              run: function(next){
                this.setPageBtn.click();
                next && next();
              }
            },
            {
              checkDepend: function(){
                var setIframe = this.setIframe = document.querySelector('#account');
                if(setIframe && setIframe.contentWindow && setIframe.contentWindow.document && setIframe.contentWindow.document.getElementById('openPOP3') && setIframe.contentWindow.document.getElementById('setBtnSave')){
                  return true;
                }else{
                  return false;
                }
              },
              run: function(next){
                var self = this;
                setTimeout(function(){
                  if(!self.setIframe.contentWindow.document.getElementById('openPOP3').checked){
                    self.setIframe.contentWindow.document.getElementById('lbl_openPOP3').click();
                    setTimeout(function(){
                      self.setIframe.contentWindow.document.getElementById('setBtnSave').click();
                      next && next();
                    }, 100);
                  }else{
                    next && next();
                  }
                },1000);
              }
            },
            {
              checkDepend: function(){
                return true;
              },
              run: setDone
            }
          ];

          // document.querySelector('#account').contentWindow.document.getElementById('openPOP3').checked=true;
          // document.querySelector('#account').contentWindow.document.getElementById('setBtnSave').click()
        break;
        default:
        break;
      }
      //var isBreak = false;
      var curIndex = 0;
      function loopRunTask(taskQue){
        debugger;
        var task = taskQue[curIndex];
        if(task){
          task.loopTime = task.loopTime || 0;
          task.loopTime ++;
          if(task.checkDepend()){
            curIndex ++;
            try{
              task.run(loopRunTask.bind(this, taskQue));
            }catch(err){
              console.error(err);
              //loopRunTask(taskQueue)
            }
          }else{

            console.log('waiting!');
            
            if(task.loopTime%self.retryInterval == 0){
              console.log('retry last step');
              //curIndex --;
              var lastTask = taskQue[curIndex - 1];
              lastTask.retry = lastTask.retry || 0;
              if(lastTask.retry <= self.maxRetry){
                lastTask.retry ++;
                curIndex --;
              }
            }

            if(task.loopTime > self.maxLoop){
              //isBreak = true;
              return ignoreSet && ignoreSet();
            }

            //taskQue.unshift(task);
            setTimeout(function(){
              loopRunTask(taskQue);
            },self.loopInterval);
          }
        }
      }
      loopRunTask(taskQueue);
    },
    getQsfromUrl: function(url){
      !url && (url=win.location.href);
      var orgQs = url.match(/\?(.*)/);
      var ret = {};
      orgQs && (orgQs=orgQs[1]);
      if(orgQs){
        orgQs.split('&').forEach(function(item){
          var match = item.split('=');
          if(match.length == 2){
            ret[match[0]] = match[1];
          }
        });
      }
      return ret;
    },
    getCookie: function(key){
      var rawCookie = document.cookie;
      var tarValue = null;
      rawCookie.split(';').some(function(item){
        item = item.trim();
        itemArr = item.split('=');
        if(itemArr.length == 2 && key == itemArr[0]){
          tarValue = itemArr[1];
          return true;
        }
        return false;
      });
      return tarValue;
    },
    getSid: function(){
      switch(this.curPlatform){
        case '163':
        case '126':
          var qs = this.getQsfromUrl();
          if(qs.sid){
            //get sid send to client
            this.sid = qs.sid;
          }else{
            this.sid = this.getCookie('Coremail.sid');
          }
        break;
        case 'qq':
          if(this.sid){
            return this.sid;
          }else{
            var qs = this.getQsfromUrl();
            if(qs.sid){
              this.sid = qs.sid;
            }else{
              this.sid = this.getCookie('msid');
            }
          }
        break;
        case '139':
          if(this.sid){
            return this.sid;
          }else{
            var qs = this.getQsfromUrl();
            if(qs.sid){
              this.sid = qs.sid;
            }
          }
        break;
      }
      return this.sid;
    },
    isLoginSuccess: function(){
      if(this.platform !== 'qq'){
        var exist = false;
        this.keyMap.form.some(function(selector){
          if(doc.querySelector(selector)){
            exist = true;
            return true;
          }
        });
      }else{
        var qs = this.getQsfromUrl(Location.href);
        if(qs.sid){
          this.sid = qs.sid;
          return true;
        }else{
          return false;
        }
      }
      
      return !exist;
    },
    proxySubmitForm: function(){
      uiIntreface.hideLoaing();

      this.curStatus = 'form';
      this.redirectMap.form ++;
      localCache.set(this.cacheKey.redirectKey, this.redirectMap);

      if(this.curPlatform !== 'qq'){
        var keyMap = this.keyMap;
        var formIns = null;
        var self = this;
        keyMap.form.some(function(formSelector){
          return formIns = doc.querySelector(formSelector);
        });

        if(!formIns){
          return false;
        }
        var orgSubmit = formIns.onsubmit;
        formIns.onsubmit = function(){
          var formElem = this;
          var accountInfo = {};
          //debugger
          [].forEach.call(formElem.getElementsByTagName('input'), function(elem){
            ['account', 'password'].forEach(function(key){
              keyMap[key].some(function(elemName){
                if(elem.name == elemName){
                  accountInfo[key] = elem.value;
                  return true;
                }
                return false;
              })
            })
          });
          if(accountInfo.password && accountInfo.account){
            if(accountInfo.account.indexOf('@') == -1){
              accountInfo.account += '@'+self.curPlatform +'.com';
            }
            //localCache.set(self.cacheKey.statusCacheKey, 'logining');
            localCache.set(self.cacheKey.accountInfoCacheKey, accountInfo);
          }
          //return false;
          orgSubmit && orgSubmit();
        }
      }else{
       var submitBtn =  doc.getElementById('go');
       if(submitBtn){
         submitBtn.onclick = function(){
           //debugger
           var accountInfo = {
             account: doc.getElementById('u').value,
             password: doc.getElementById('p').value
           };
           if(accountInfo.account.indexOf('@') == -1){
             accountInfo.account += '@qq.com';
           }
           localCache.set(self.cacheKey.accountInfoCacheKey, accountInfo);
         }
       }
       
      }
    }
  }

  var eventProxy = {
    _gCounter: 0,
    _eventMap: {
    },
    on: function(evenName, func, timeout){
      var self = this;
      if(timeout){
        evenName += ++this.gCounter;
        this._eventMap[evenName] = function(){
          delete self._eventMap[evenName];
          func && func.apply(this, arguments);
        }
        setTimeout(function(){
          if(self._eventMap[evenName]){
            delete self._eventMap[evenName];
            func && func();
          }
        }, parseInt(timeout));
      }else{
        this._eventMap[evenName] = func;
      }
      return evenName;
    },
    trigger: function(evenName, datas){
      if(this._eventMap[evenName]){
        this._eventMap[evenName](datas);
      }
    }
  }

  var uiIntreface = {
    isInit: false,
    rolesMap: {
      cover: '#ehMaskCover',
      accountBox: '#ehAccountBox',
      accountInfo: '#ehAccountInfo',
      noticeBox: '#ehNoticeBox',
      statusBox: '#ehStatusBox',
      processBox: '#ehProcessBox',
      payListBox: '#ehPayListBox',
      verifyBox: '#ehVerifyBox',
      actionArea: '#ehActionArea',
      sendMsgTips: '#ehActionArea [data-role="sendMsgTips"]',
      sendReadyBtn: '#ehActionArea [data-role="sendReady"]',
      allDoneBtn: '#ehActionArea [data-role="allDone"]',
      jumpSetBtn: '#ehActionArea [data-role="jumpSet"]'
    },
    styles: [
      '.eh-mask-cover p{margin:0!important}.eh-mask-cover{background-color:#eee;position:fixed;top:0;left:0;width:100%;height:100%;z-index:99999;overflow:scroll}.eh-account-info{text-align:center}.eh-account-info span{font-size:12px;text-align:center;margin:15px auto;display:inline-block}.eh-process-info{text-align:center;font-size:15px;line-height:33px}.eh-pay-list{text-align:center;line-height:25px}.eh-pay-list p{font-size:15px}.eh-pay-list ul{}.eh-pay-list .pay-text{font-size:14px}.eh-receive-verify{text-align:left;font-size:14px}.eh-verify-send{margin:10px 0}.eh-verify-send span{display:inline-block;margin:0 10px;line-height:28px}.eh-verify-send a{display:inline-block;padding:8px 30px;font-size:12px;border:1px solid blue;border-radius:2px;background-color:white;cursor:pointer}.eh-verify-receive label{margin:0 0 0 10px}.eh-verify-receive input{line-height:25px;width:203px}.eh-action-area{background-color:white;text-align:center;padding:20px 5px;margin:15px 0}.eh-action-area .action-btn{display:block;width:100%;line-height:37px;font-size:16px;border-radius:2px;margin:20px 0;text-align:center}.eh-action-area .send-msm{border:1px solid blue;background-color:white}.eh-action-area .done{border:1px solid #ddd;background-color:#ddd}.eh-action-area .jump-info{display:inline-block;font-size:13px}.eh-status-box{text-align:center}.eh-status-box .status-bg{display:inline-block;width:100px;height:100px;border-radius:100px;background-color:#ddd;line-height:100px}.hide{display:none!important}.eh-notice-box{text-align:center;line-height:25px;margin:10px 0}.eh-notice-box b{display:block}.eh-notice-box p{font-size:14px}',
    ],
    htmls: [
      '<section class=eh-mask-cover id="ehMaskCover"><div class=eh-account-info id="ehAccountBox"><span id="ehAccountInfo">当前邮箱： yfhe2coder@163.com</span></div><div class=eh-status-box id="ehStatusBox"><span class=status-bg>加载状态</span></div><div class="eh-notice-box" id="ehNoticeBox" ><b>短信验证</b><p>一次配置邮箱，今后无需再登陆</p><p>信用卡账单轻松获取</p></div><div class=eh-process-info id="ehProcessBox"><p>成功配置邮箱</p><p>正在导入账单…(88%)</p></div><div class=eh-pay-list id="ehPayListBox"><p>新增一张信用卡提醒，导入3份账单</p><div><i class=bank-icon></i><span class=pay-text>招行 2919 2016年7月账单</span><i class=flag-icon></i></div><div><i class=bank-icon></i><span class=pay-text>招行 2919 2016年7月账单</span><i class=flag-icon></i></div></div><div class=eh-receive-verify id="ehVerifyBox"><div class=eh-verify-send><span data-role="phoneNum">手机号：135***3607</span><a data-role="sendVerify">获取验证码</a></div><div class=eh-verify-receive><label>验证码：</label><input data-role="verifyInput" type=text placeholder="输入短信验证码"></div></div><div class=eh-action-area id="ehActionArea"><p class="header-info" data-role="sendMsgTips">自动发送短信请求配置邮箱</p><button class="action-btn send-msm" data-role="sendReady" >确认发送</button><button class="action-btn done hide" data-role="allDone">完成</button><a class="jump-info" data-role="jumpSet">跳过（每次采用登陆邮箱获取）</a></div></section>'
    ],
    _tpl: {
      mask: [
      ],
      sendMsg: [

      ],
      setVeryfyCode: [

      ],
      loading: [

      ],
      loadDone: [

      ],
      loadingProcess: [
        
      ],
      accountInfo: [

      ],
      payListItem: [

      ]
    },
    bindUI: function(){
      var self = uiIntreface;
      var roles = {};
      var rolesMap = self.rolesMap;
      Object.keys(rolesMap).forEach(function(roleName){
        var elem = doc.querySelector(rolesMap[roleName]);
        if(elem){
          roles[roleName] = {
            elem: elem,
            //orgDispType: elem.style.display,
            hide: function(){
              this.elem.style.display = 'none';
            },
            show: function(){
              this.elem.style.display ='';
            }
          }
          if(['cover', 'statusBox'].indexOf(roleName) === -1){
            roles[roleName].hide();
          }
         //roles.hide();
        }else{
          console.log('missing role ' + roleName);
        }
      });
      // if(roles.cover.elem){
      //   roles.cover.elem.style.width = (win.innerWidth || win.outerWidth || win.screen.width) + 'px';
      //   roles.cover.elem.style.height = (win.innerHeight || win.outerHeight || win.screen.height) + 'px';
      // }
      self.roles = roles;
    },
    prepare: function(){
      var self = this;
      console.log('prepare ui');
      if(doc.readyState === 'complete'){
        self.init();
      }else{
        var _timer = setTimeout(function(){
          self.init();
        }, 2000);

        win.addEventListener('load', function(){
          clearTimeout(_timer);
          self.init();
        });
      }
    },
    init: function(){
      if(this.isInit){
        return false;
      }
      this.isInit = true;
      var self = uiIntreface;
      //debugger
      //innsert style
      // if(doc.head){
      //   var metaElem = doc.createElement('meta');
      //   metaElem.name = 'viewport';
      //   metaElem.content = 'width=device-width, initial-scale=1.0, maximum-scale=2.0, minimum-scale=1.0, user-scalable=no';
      //   doc.head.appendChild(metaElem);

      //   var styleElem = doc.createElement('style');
      //   styleElem.innerHTML = self.styles.join('');
      //   doc.head.appendChild(styleElem);
      // }else{
      //   doc.write('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, minimum-scale=1.0, user-scalable=no">');
      //   doc.write('<style>'+self.styles.join('')+'</style>');
      // }
      
      //insert htmls
      var tempDiv = doc.createElement('div');
      tempDiv.style.display = 'none';
      tempDiv.innerHTML = self.htmls.join('');
      debugger;
      if(doc.body){
        //tempDiv.innerHTML = this.htmls.join('');
        doc.body.parentElement.appendChild(tempDiv);
        setTimeout(function(){
          self.bindUI();
          tempDiv.style.display = '';
        }, 500);
      }else{
        doc.addEventListener('DOMContentLoaded',function(){
          doc.body.parentElement.appendChild(tempDiv);
          setTimeout(function(){
            self.bindUI();
            tempDiv.style.display = '';
          }, 500);
        });
      }
    },
    checkUiBind: function(){
      if(!this.roles){
        this.bindUI();
      }
      return this.roles ? true : false;
    },
    hideLoaing: function(){
      this.checkUiBind() && this.roles.cover.hide();
      nativeApi.hideCover();
    },
    setAccountInfo: function(account){
      if(this.checkUiBind()){
        this.roles.accountInfo.elem.innerText = '当前邮箱：' + account;
        this.roles.accountInfo.show();
        this.roles.accountBox.show();
      }
    },
    showVerifyBox: function(phoneNum, sendMsg, done, jump){
      !this.roles && this.bindUI();
      if(this.checkUiBind()){
        var roles = this.roles;
        var verifyRoot = roles.verifyBox.elem;
        verifyRoot.querySelector('[data-role="phoneNum"]').innerText = '手机号：' + phoneNum;
        verifyRoot.querySelector('[data-role="sendVerify"]').onclick = function(){
          console.log('send message');
          sendMsg();
        };
        var verifyInput = verifyRoot.querySelector('[data-role="verifyInput"]');
        roles.verifyBox.show();
        roles.noticeBox.show();
        
        //var actionAreaRoot = roles.actionArea.elem;
        roles.actionArea.show();
        roles.sendReadyBtn.elem.innerText = '完成';
        roles.sendReadyBtn.elem.onclick = function(){
          debugger;
          console.log('click done!');
          var verifyCode = verifyInput.value;
          if(!verifyCode){
            verifyInput.style.borderColor = 'red';
            return;
          }
          verifyInput.style.borderColor = '';
          done && done(verifyCode, function(){
            verifyInput.style.borderColor = 'red';
          });
        }
        roles.sendReadyBtn.show();

        roles.jumpSetBtn.elem.onclick = function(){
          console.log('jumpset');
          jump && jump();
        }
        roles.jumpSetBtn.show();
      }
    },
    showSendMsgBox: function(done, jump){
      !this.roles && this.bindUI();
      if(this.checkUiBind()){
        var roles = this.roles;
        roles.noticeBox.show();
        roles.actionArea.show();
        roles.sendMsgTips.show();
        roles.sendReadyBtn.elem.innerText = '确认发送';
        roles.sendReadyBtn.elem.onclick = function(){
          debugger;
          console.log('click send msage!');
          //todo send msg

          done && done()

          // var verifyCode = verifyInput.value;
          // if(!verifyCode){
          //   verifyInput.style.borderColor = 'red';
          //   return;
          // }
          // verifyInput.style.borderColor = '';
          // done && done(verifyCode, function(){
          //   verifyInput.style.borderColor = 'red';
          // });
        }
        roles.sendReadyBtn.show();

        roles.jumpSetBtn.elem.onclick = function(){
          console.log('jumpset');
          jump && jump();
        }
        roles.jumpSetBtn.show();
      }
    }
  }

  var hostWhiteList = [
    'ui.ptlogin2.qq.com',
    'w.mail.qq.com',
    'mail.qq.com',
  ];

  //展开浮层
  console.log('insert ui style');
  if(doc.head){
    var metaElem = doc.createElement('meta');
    metaElem.name = 'viewport';
    metaElem.content = 'width=device-width, initial-scale=1.0, maximum-scale=2.0, minimum-scale=1.0, user-scalable=no';
    doc.head.appendChild(metaElem);

    var styleElem = doc.createElement('style');
    styleElem.innerHTML = uiIntreface.styles.join('');
    doc.head.appendChild(styleElem);
  }else{
    doc.write('<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0, minimum-scale=1.0, user-scalable=no">');
    doc.write('<style>'+uiIntreface.styles.join('')+'</style>');
  }

  nativeApi.showCover();

  setTimeout(function(){
    if(!win.ehInit  && !win.ehDisable){
      win.ehInit = true;
      try{
        var localCache = {
          _cacheMap: {},
          get: function(key){
            return this._cacheMap[key];
          },
          set: function(key, value){
            this._cacheMap[key] = value;
            nativeApi.setCache(this._cacheMap);
            //alert('key:'+key +'&val:'+value);
          }
        };

        uiIntreface.prepare();
        loginControl.prepare();
      }catch(err){
        console.error(err);
      }
    }else{
      nativeApi.hideCover();
    }
  }, 0);
  
//}(window, document));