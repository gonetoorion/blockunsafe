function config_error(){
    document.body.innerHTML = "CONFIG ERROR!";
}
function deal_success(){
    document.getElementById("add_sign").innerHTML = "Added successfully";
    document.getElementById("add_sign").style.display = "block";
    setTimeout(function(){
        document.getElementById("add_sign").style.display = "none";
    }, 1500);
}
function deal_failed(error){
    alert("Add failed");
}
function reset_rule(lhn){
    let pattern_key = lhn + 'urlpattern';
    let max_class_key = lhn + 'classkeyx';
    let rm_hl = browser.storage.local.remove([pattern_key, max_class_key]);
    rm_hl.then(function(){
        document.getElementById("add_sign").innerHTML = "Reset successfully";
        document.getElementById("add_sign").style.display = "block";
        setTimeout(function(){
            document.getElementById("add_sign").style.display = "none";
        }, 1500);
    }, function(e){alert(e);});
}
function init_config_page(){
    let f_key = "";
    let config_url_marks = ["z", "e", "t"];
    let is_config_page = false;
    for(let i=0,len=config_url_marks.length; i<len; i++){
        let config_url = "https://www.blockunsafe.com/"+config_url_marks[i]+"config.html";
        let no_www_config_url = "https://blockunsafe.com/"+config_url_marks[i]+"config.html";
        if(window.location.href.indexOf(config_url)==0||window.location.href.indexOf(no_www_config_url)==0){
            is_config_page = true;
            break;
        }
    }
    if(!is_config_page){
        return;
    }
    let arg = window.location.search;
    arg = arg.replace("?", "");
    if(arg.indexOf("f_key=")!=0){
        config_error();
        return;
    }
    if(arg.indexOf("&")==-1){
        f_key = arg.slice(arg.indexOf("f_key=")+6);
    }else{
        f_key = arg.slice(arg.indexOf("f_key=")+6, arg.indexOf("&"));
    }
    if(!f_key){
        config_error();
        return;
    }
    let lhn = arg.slice(arg.indexOf("lhn=")+4, arg.indexOf("&cltp"));
    if(!lhn){
        config_error();
        return;
    }
    document.getElementById("reset_filter_rule_btn").addEventListener('click', function(e){
        if(confirm("Are you sure you want to reset the filter rules ? ")){
            reset_rule(lhn);
        }
    });
    document.getElementById("domain_eff_page").innerHTML = f_key;
    f_key += "_fbkssousousous";
    init_k_w_data(f_key);
    document.getElementById("add_kw_btn").addEventListener("click", function(){
        let keyword = document.getElementById('add_kw_v').value;
        keyword = keyword.trim();
        if(keyword==''||keyword.replace(/\s*/g,"")==''){
            alert('Please add blocked keywords');
            return;
        }
        browser.storage.local.get(f_key, function(results){
            let k_w = `${results[f_key]}`;
            let k_w_values = [];
            if(k_w!="undefined"&&k_w!=""){
                k_w_values = k_w.split(",");
            }
            if(k_w_values.indexOf(keyword)!=-1){
                alert("The keywords already exists，don't  add it again~");
                return;
            }
            k_w_values.push(keyword);
            k_w_dict = {};
            k_w_dict[f_key] = k_w_values;
            browser.storage.local.set(k_w_dict).then(deal_success, deal_failed);
            add_keyword_span(keyword, f_key);
        });
    });
}
function init_k_w_data(f_key){
    browser.storage.local.get(f_key, function(results){
        if(!results.hasOwnProperty(f_key)){
            return;
        }
        for(let i=0,len=results[f_key].length; i<len; i++){
            add_keyword_span(results[f_key][i], f_key);
        }
    });
}
function add_keyword_span(keyword, f_key){
    let span_dom = document.createElement('span');
    let span_id = 'span_dom_xt_' + keyword;
    span_dom.style = "background-color:rgb(244, 234, 194);color:rgb(198, 94, 36);font-size:12px;padding:3px 12px 3px 15px;border-radius:3px 3px 3px 3px;margin-right:5px;margin-top:5px;";
    span_dom.innerHTML = keyword+'&nbsp;&nbsp;<span style="color:#666;text-decoration:none;cursor:pointer;" id="'+span_id+'">x</span>';
    document.getElementById('show_filter_keyword').appendChild(span_dom);
    document.getElementById(span_id).addEventListener('click', function(){
        this.parentNode.remove();
        browser.storage.local.get(f_key, function(results){
            let filter_keywords = [];
            for(let i=0,len=results[f_key].length; i<len; i++){
                filter_keywords.push(results[f_key][i]);
            }
            filter_keywords.splice(filter_keywords.indexOf(keyword), 1);
            let values = {};
            values[f_key] = filter_keywords;
            browser.storage.local.set(values);
        });
    });
}
function get_domain(){
    let host_info = location.hostname.split('.');
    for(let i=host_info.length-1,stop_i=host_info.length-3;i>stop_i;i--){
        if(f_key){
            f_key = host_info[i] + '.' + f_key;
        }else{
            f_key = host_info[i];
        }
    }
}
function check_dom(dom_node){
    dom_node.style.display = 'none';
}
function parse_dom_nodes(dom_nodes){
    let filter_dom_childs = [];
    for(let i=0,len=dom_nodes.length; i<len; i++){
        if(dom_nodes[i].nodeType!=1||dom_nouse.indexOf(dom_nodes[i].nodeName)!=-1){
            continue;
        }
        if(no_check_tag.indexOf(dom_nodes[i].nodeName)!=-1&&all_ok){
            check_update(dom_nodes[i]);
            continue;
        }
        let class_tag = dom_nodes[i].getAttribute('class');
        if(class_tag&&!all_ok){
            class_tag = class_tag.replace(/(^\s*)|(\s*$)/g, "");
            if(dom_dict[class_tag]==undefined){
                dom_dict[class_tag] = 0;
            }else{
                dom_dict[class_tag] = dom_dict[class_tag] + 1;
            }
        }
        if(dom_nodes[i].childNodes.length){
            filter_dom_childs.push(...dom_nodes[i].childNodes);
        }
    }
    if(filter_dom_childs.length){
        parse_dom_nodes(filter_dom_childs);
    }
}
function check_update(mut_node){
    if(no_target_class.indexOf(mut_node.className)!=-1){
        return;
    }
    for(let i=0,len=warn_words.length;i<len;i++){
        if(mut_node.innerText.toLowerCase().indexOf(warn_words[i])!=-1){
            check_dom(mut_node);
            break;
        }
    }
}
function analy_page(mut_nodes){
    if(!filter_keywords||!filter_keywords.length){
        return;
    }
    if(all_ok){
        if(!mut_nodes.innerText||!mut_nodes.innerText.replace(/\s+/g, '')){
            return;
        }
        for(let i=0,len=filter_keywords.length;i<len;i++){
            if(mut_nodes.parentNode&&mut_nodes.parentNode.getAttribute('id')==filter_words_area){
                return;
            }
            if(mut_nodes.innerText.toLowerCase().indexOf(filter_keywords[i].toLowerCase())!=-1){
                warn_words.push(filter_keywords[i].toLowerCase());
            }
        }
        if(!warn_words.length){
            return;
        }
        if(no_check_tag.indexOf(mut_nodes.nodeName)!=-1){
            check_dom(mut_nodes);
            return;
        }
        parse_dom_nodes(mut_nodes.childNodes);
        if(class_set.indexOf(mut_nodes.className)!=-1){
            check_dom(mut_nodes);
        }else{
            for(let i=0,len=class_set.length; i<len; i++){
                let childs = mut_nodes.getElementsByClassName(class_set[i]);
                if(!childs){
                    continue;
                }
                for(let j=0,lenx=childs.length; j<lenx; j++){
                    check_update(childs[j]);
                }
            }
        }
    }else{
        let class_tag = mut_nodes.getAttribute('class');
        if(class_tag){
            class_tag = class_tag.replace(/(^\s*)|(\s*$)/g, "");
            if(dom_dict[class_tag]==undefined){
                dom_dict[class_tag] = 0;
            }else{
                dom_dict[class_tag] = dom_dict[class_tag] + 1;
            }
        }
        parse_dom_nodes(mut_nodes.childNodes);
    }
}
function get_max_node(){
    let max_key = '';
    for(let key in dom_dict){
        if(max_key==''||dom_dict[max_key]<dom_dict[key]){
            max_key = key;
        }
    }
    return max_key;
}
function save_pattern(pattern_url){
    if(pattern_set){
        if(pattern_set.indexOf(pattern_url)!=-1){
            return;
        }else{
            pattern_set.push(pattern_url);
        }
    }else{
        pattern_set = [pattern_url];
    }
    let pattern_values = {};
    pattern_values[pattern_key] = pattern_set;
    browser.storage.local.set(pattern_values);
}
function check_url_pattern(url){
    if(!pattern_set){
        return false;
    }
    if(url=='/'&&pattern_set.indexOf(url)!=-1){
        return true;
    }
    let is_in = false;
    let url_param = url.split('/');
    url_param.shift();
    for(let i=0,len=pattern_set.length; i<len; i++){
        let test_url_param = pattern_set[i].split('/');
        test_url_param.shift();
        if(test_url_param.length!=url_param.length){
            continue;
        }
        let diff_count = 0;
        for(let ix=0,lenx=test_url_param.length; ix<lenx; ix++){
            if(isNaN(test_url_param[ix])!=isNaN(url_param[ix])){
                break;
            }
            if(test_url_param[ix]!=url_param[ix]&&isNaN(url_param[ix])){
                diff_count += 1;
            }
            if(diff_count>1){
                break;
            }
            if(ix==lenx-1){
                is_in = true;
            }
        }
        if(is_in){
            break;
        }
    }
    return is_in;
}
function start_filter(f_key){
    browser.storage.local.get(f_key, function(results){
        let k_w = `${results[f_key]}`;
        if(k_w=="undefined"||k_w==""){
            return;
        }
        filter_keywords = k_w.split(",");
        let dom_observer = new MutationObserver(function(mutations){
            if(is_first&&document.body&&document.readyState=='complete'){
                document.body.style.display = 'block';
                is_first = false;
            }
            for(let mut of mutations){
                let mut_add_nodes = mut.addedNodes;
                for(let mut_node of mut_add_nodes){
                    if(!(dom_nouse.indexOf(mut_node.nodeName)==-1&&mut_node.nodeType==1)){
                        continue;
                    }
                    warn_words = [];
                    analy_page(mut_node);
                }
            }
            if(all_ok){
                return;
            }
            for(let key in dom_dict){
                if(document.body.style.display=='none'||document.body.style.display==''){
                    return;
                }
                let class_nodes = document.getElementsByClassName(key);
                if(class_nodes.length>1){
                    let test_node = class_nodes[0];
                    let count = 0;
                    if(!test_node.offsetWidth){
                        no_target_class.push(key);
                        continue;
                    }
                    for(let i=1,len=class_nodes.length;i<len;i++){
                        if((class_nodes[i].innerText==test_node.innerText&&class_nodes[i].parentNode==test_node.parentNode)||(!class_nodes[i].offsetWidth&&!class_nodes[i].innerText)||class_nodes[i].offsetWidth!=test_node.offsetWidth){
                            no_target_class.push(key);
                            break;
                        }
                        if(class_nodes[i].parentNode==test_node.parentNode){
                            count++;
                        }
                        if(count>2){
                            break;
                        }
                    }
                    if(count==0){
                        no_target_class.push(key);
                    }
                }else{
                    no_target_class.push(key);
                }
            }
            for(let i=0,len=no_target_class.length;i<len;i++){
                if(no_target_class[i] in dom_dict){
                    delete dom_dict[no_target_class[i]];
                }
            }
            max_key = get_max_node();
            if(max_key){
                let max_nodes = document.getElementsByClassName(max_key);
                if(!max_nodes){
                    delete dom_dict[max_key];
                    return;
                }
                let max_node_width = max_nodes[0].offsetWidth;
                if(max_node_width/document.body.clientWidth>0.9){
                    delete dom_dict[max_key];
                    return;
                }
                if(top_widths.indexOf(max_node_width)==-1){
                    top_widths.push(max_node_width);
                }
                if(Math.max.apply(null, top_widths)>max_node_width){
                    if(dom_dict[max_key]>5){
                        dom_dict[max_key] -= 5;
                    }
                }
                if(class_set&&max_key==class_set[class_set.length-1]){
                    save_pattern(pattern_url);
                    all_ok = true;
                    return;
                }
                if(dom_dict[max_key]>test_value){
                    let s_top = document.documentElement.scrollTop || document.body.scrollTop;
                    if(s_top<4000){
                        return;
                    }
                    for(let class_key in dom_dict){
                        if(class_key==max_key){
                            continue;
                        }
                        if(class_setx.indexOf(class_key)==-1){
                            class_setx.push(class_key);
                        }
                    }
                    if(class_setx.indexOf(max_key)==-1){
                        class_setx.push(max_key);
                    }
                    let max_class_values = {};
                    max_class_values[max_class_key] = class_setx;
                    browser.storage.local.set(max_class_values);
                    save_pattern(pattern_url);
                    location.reload();
                    class_set = class_setx;
                    all_ok = true;
                }
            }
        });
        dom_observer.observe(document, {childList: true, subtree: true, attributes: true});
    });
}
function init_class_set(start_filter, f_key, pattern_key){
    f_key += '_fbkssousousous';
    browser.storage.local.get(max_class_key, function(results){
        let clt = `${results[max_class_key]}`;
        if(clt!="undefined"&&clt!=""){
            class_set = clt.split(",");
            class_setx = class_set;
        }
        init_pattern_set(pattern_key, f_key);
    });
}
function init_pattern_set(pattern_key, f_key){
    browser.storage.local.get(pattern_key, function(results){
        let ptn = `${results[pattern_key]}`;
        if(ptn!="undefined"&&ptn!=""){
            pattern_set = ptn.split(",");
        }
        all_ok = class_set&&check_url_pattern(pattern_url);
        if(document.body){
            if(all_ok){
                document.body.style.display = 'none';
            }
            setTimeout(show_page, 2000);
        }
        start_filter(f_key);
    });
}
//browser.storage.local.clear();
let f_key = "";
let is_first = true;
let test_value = 40;
let dom_dict = {};
let warn_words = [];
let max_class_key = location.hostname + 'classkeyx';
let pattern_url = window.location.pathname;
let pattern_key = location.hostname + 'urlpattern';
let all_ok = false;
let class_set = [];
let class_setx = [];
let pattern_set = [];
let top_widths = [];
let config_domain = "blockunsafe.com";
let filter_keywords = [];
let no_target_class = [];
let filter_words_area = "show_filter_keyword";
let no_check_tag = ['LI','TR'];
let dom_nouse = ['SCRIPT','STYLE','TEXTAREA','svg','LINK','IFRAME','EM','I','IMG','FIELDSET','LEGEND','BR','OPTION','SELECT','INPUT','BUTTON','FORM','STRONG','TEXTAREA','FOOTER','META'];
function start_up(){
    get_domain();
    if(!f_key){
        return;
    }
    if(f_key==config_domain){
        return;
    }
    init_class_set(start_filter, f_key, pattern_key);
}
window.onload = function(){
    init_config_page();
}
function show_page(){
    if(is_first){document.body.style.display = 'block';}
}
start_up();
