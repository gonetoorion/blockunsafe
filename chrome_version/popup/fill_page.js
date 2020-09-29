window.onload = function(){
    let f_key = "";
    let filter_keywords = [];
    let add_kyw_id = "add_kyw_btn";
    let f_key_slot = "f_key_slot";
    let config_url = "https://www.blockunsafe.com/config.html?f_key=";
    function get_url(tabs){
        let url = tabs[0].url;
        if(!url){
            return;
        }
        let url_info = new URL(url);
        let last_hostname = url_info.hostname;
        let host_info = url_info.host.split('.');
        for(let i=host_info.length-1,stop_i=host_info.length-3;i>stop_i;i--){
            if(f_key){
                f_key = host_info[i] + '.' + f_key;
            }else{
                f_key = host_info[i];
            }
        }
        if(!f_key||f_key=="undefined.newtab"){
            return;
        }
        let orignal_f_key = f_key;
        f_key += "_fbkssousousous";
        if(config_url.indexOf(orignal_f_key)==-1){
            let lan = chrome.i18n.getUILanguage();
            lan = lan.toLowerCase();
            let lan_prefix = "";
            if(lan=="zh-cn"){
                lan_prefix = "z";
            }else if(lan=="zh-hk"||lan=="zh-tw"){
                lan_prefix = "t";
            }else{
                lan_prefix = "e";
            }
            let config_lan = lan_prefix+"config";
            document.getElementById(add_kyw_id).setAttribute("href", config_url.replace("config", config_lan)+orignal_f_key+"&lhn="+last_hostname+"&cltp=2");
            document.getElementById(add_kyw_id).addEventListener("click", function(){
                setTimeout(function(){
                    document.getElementById(add_kyw_id).setAttribute("href", "#");
                    document.getElementById(add_kyw_id).removeAttribute("target");
                }, 10);
            });
        }
        init_data(true);
    }
    function start_up(){
        chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
            get_url(tabs);
        });
    }
    start_up();
    function init_data(is_init_panel){
        if(filter_keywords){
            filter_keywords = [];
        }
        chrome.storage.local.get(f_key, function(results){
            if(!results.hasOwnProperty(f_key)){
                add_note();
                return;
            }
            if(results[f_key].length==0){
                add_note();
            }
            for(let i=0,len=results[f_key].length; i<len; i++){
                filter_keywords[i] = results[f_key][i];
                if(is_init_panel){
                    add_keyword_span(results[f_key][i]);
                }
            }
        });
    }
    function add_note(){
        let show_node = document.getElementById('show_filter_keyword');
        show_node.innerHTML = "The blocked keywords you added will appear here and you can click the button above to enter the configuration page to add blocking keywords.";
    }
    function add_keyword_span(keyword){
        let span_dom = document.createElement('span');
        let span_id = 'span_dom_xt_' + keyword;
        span_dom.style = "background-color:rgb(244, 234, 194);color:rgb(198, 94, 36);font-size:12px;padding:3px 12px 3px 15px;border-radius:3px 3px 3px 3px;margin-right:5px;margin-top:5px;";
        span_dom.innerHTML = keyword+'&nbsp;&nbsp;<span style="color:#666;text-decoration:none;cursor:pointer;" id="'+span_id+'">x</span>';
        document.getElementById('show_filter_keyword').appendChild(span_dom);
        document.getElementById(span_id).addEventListener('click', function(){
            this.parentNode.remove();
            filter_keywords.splice(filter_keywords.indexOf(keyword), 1);
            let values = {};
            values[f_key] = filter_keywords;
            chrome.storage.local.set(values);
        });
    }
}
