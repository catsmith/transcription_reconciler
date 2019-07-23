var REC = (function () {


    return {

        file1: null,
        file2: null,
        file1String: null,
        file2String: null,

        notesRegex: /\{(.*?)\}/g, //vat par check removed from regex
        structureRegex: /[\||<](.*?)[\||>]/g,

        bookRegex: /\|\s*?B\s*?(\d+?)\|/g,
        chapterRegex: /\|\s*?K\s*?(\d+?|incipit|explicit)\|/g,
        verseRegex: /\|\s*?V\s*?(\d+?)\|/g,

        folioRegex: /^\|F\s*?(\d+?)([rvab])\S{0,1}\||^\|F([rvab])\s*?(\d+?)\S{0,1}\|/i,
        pageRegex: /^\|P\s*?(\d+?)\|/i,
        columnRegex: /^\|C\s*?(\d+?)\|/i,
        linebreakRegex: /^\|L\s*?\d*\|/i,

        file1Background: '#990033;',
        file1TextColour: 'white;',
        file2Background: '#009933;',
        file2TextColour: 'white;',

        checkedState: 'show',
        mode: 'text',

        results: {},
        options: {},
        sortorder: [],


        uploadFile: function() {
          var f;
          f = document.getElementById('file').files[0];
          if (REC.file1 === null) {
            REC.file1 = f;
            document.getElementById('file1_details').innerHTML = escape(f.name) +
              '<img class="delete_logo" onclick="javascript:REC.deletefile(\'file1\');" alt="delete" title="delete this file" src="delete.png"/>';
            document.getElementById('file').value = '';
          } else {
            if (REC.file2 === null) {
              REC.file2 = f;
              document.getElementById('file2_details').innerHTML = escape(f.name) +
                '<img class="delete_logo" onclick="javascript:REC.deletefile(\'file2\');" alt="delete" title="delete this file" src="delete.png"/>';
              document.getElementById('file').value = '';
              document.getElementById('compare_button').removeAttribute('disabled');
            } else {
              alert('two files already loaded');
            }
          }
        },

        deletefile: function(file) {
          document.getElementById(file + '_details').innerHTML = '';
          if (file === 'file1') {
            REC.file1 = null;
          }
          if (file === 'file2') {
            REC.file2 = null;
          }
        },

        format_text: function(text, opt) {
          var i, lines, line;
          if (REC.mode === 'xml') {
            text = text.replace(/(\r\n|\n|\r)/gm, '');
          } else {
            text = text.replace(/(\r\n|\n|\r)/gm, ' ');
          }
          text = text.replace(REC.notesRegex, '\n{$1}\n');
          lines = text.split('\n');
          for (i = 0; i < lines.length; i += 1) {
            line = lines[i];
            if (line.length > 0 && (opt['ignore_status_note'] === true && line.search(/\{Status/) !== -1)) {
              lines[i] = '';
            } else {
              if (line.length > 0 && line[0] === '{') {
                line = line.replace(/</g, '-');
                line = line.replace(/\|/g, '-');
                line = line.replace(/>/g, '-');
                line = line.replace(/\[/g, '(');
                line = line.replace(/\]/g, ')');
                lines[i] = line;
              }
            }
          }
          text = lines.join('\n');
          text = text.replace(REC.structureRegex, '\n|$1|\n');
          lines = text.split('\n');
          return lines;
        },

        trim: function (s) {
            s = s.replace(/(^\s*)|(\s*$)/gi, '');
            s = s.replace(/[ ]{2,}/gi, ' ');
            s = s.replace(/\n /, '\n');
            return s;
        },

        clean_verse_text: function (text, opt) {
            text = text.toLowerCase();
            text = text.replace(/\u0305/g, '~');//get rid of combining nomsac lines
            text = text.replace(/\u0323/g, '_');//get rid of underdots
            if (opt['ignore_final_nu'] == true) {
          		text = text.replace(/\u0304/g, '\u03BD');//final nu replacement
          		text = text.replace(/¯/g, '\u03BD'); //final nu for xml
            }
            if (opt['ignore_entities'] == true) {
              text = text.replace(/&[^;]+?;/g, '');
            }
            if (opt['ignore_comment_om']) {
    		      text = text.replace(/\{\s*om\s*\}/g, '');
            }
            if (opt['ignore_comment_comm']) {
    		      text = text.replace(/\{\s*comm\s*\}/g, '');
            }
            if (opt['ignore_comment_lect']) {
    		      text = text.replace(/\{\s*lect\s*\}/g, '');
            }
            if (opt['ignore_parenthesis']) {
    		      text = text.replace(/\(/g, '');
    		      text = text.replace(/\)/g, '');
            }
            if (opt['ignore_punctuation']) {
          		text = text.replace(/\u0387/g, ''); //ano teleia
          		text = text.replace(/\u00B7/g, '');//middle dot
          		text = text.replace(/\u037E/g, '');//greek question mark
          		text = text.replace(/˙/g, '');
          		text = text.replace(/'/g, '');
          		text = text.replace(/\./g, '');
          		text = text.replace(/;/g, '');
          		text = text.replace(/,/g, '');
          		text = text.replace(/:/g, '');
            }
            if (opt['ignore_linebreaks'] == true) {
    		        while (text.search('= ') != -1) {
    		            text = text.replace('= ', '');
    		        }
    		        while (text.search('=') != -1) {
    		            text = text.replace('=', '');
    		        }
            }
            if (opt['ignore_comments'] == true) {
    		      text = text.replace(/\{.+?\}/g, '');
            }
            if (opt['ignore_tags'] == true){
    		      text = text.replace(/\[.+?\]/g, '');
            }

            return text;
	       },

	extract_verse_text: function(text, opt) {
	  var i, lines, verse_dict, b, k, v, n, working, order, key, line;
	  lines = REC.format_text(text, opt);
	  verse_dict = {};
	  b = null;
	  k = null;
	  v = null;
	  working = [];
	  order = [];
	  key = 'preVerse1';
	  for (i = 0; i < lines.length; i += 1) {
	    line = lines[i];
	    if (line.search(REC.bookRegex) !== -1) {
	      b = line.replace(REC.bookRegex, '$1');
	      if (b[0] === '0') {
	        b = b.slice(1);
	      }
	    } else {
	      if (line.search(REC.chapterRegex) !== -1) {
	        k = line.replace(REC.chapterRegex, '$1');
	        if (k.length === 1) {
	          k = '0' + k;
	        }
	      } else {
	        if (line.search(REC.verseRegex) !== -1) {
	          if (working.length > 0) {
	            if (typeof verse_dict[key] === 'undefined') {
	              if (REC.mode === 'xml') {
	                verse_dict[key] = REC.trim(REC.clean_verse_text(working.join(''), opt));
	              } else {
	                verse_dict[key] = REC.trim(REC.clean_verse_text(working.join(' '), opt));
	              }
	              order.push(key);
	            }
	          }
	          v = line.replace(REC.verseRegex, '$1');
	          if (v.length === 1) {
	            v = '0' + v;
	          }
	          key = b + '_' + k + ':' + v;
	          if (verse_dict.hasOwnProperty(key)) {
	            verse_dict[key + '-1'] = verse_dict[key];
	            order[order.indexOf(key)] = key + '-1';
	            delete verse_dict[key];
	            n = 2;
	            key = key + '-' + n;
	          } else if (verse_dict.hasOwnProperty(key + '-1')) {
	            n = 2;
	            key = key + '-' + n;
	          }
	          while (verse_dict.hasOwnProperty(key)) {
	            n += 1;
	            key = key.substring(0, key.indexOf('-')) + '-' + n;
	          }
	          working = [];
	        } else {
	          if ((opt['ignore_pagecolumn_layout'] === true &&
	              (line.search(REC.columnRegex) != -1 ||
	                line.search(REC.pageRegex) != -1 ||
	                line.search(REC.folioRegex) != -1)) ||
	            (opt['ignore_linebreaks'] === true &&
	              line.search(REC.linebreakRegex) != -1)) {
	            //squelch
	          } else {
	            if (REC.mode === 'xml') {
	              working.push(line);
	            } else {
	              working.push(REC.trim(line));
	            }
	          }
	        }
	      }
	    }
	  }
	  if (working.length > 0) {
	    if (REC.mode === 'xml') {
	      verse_dict[key] = REC.trim(REC.clean_verse_text(working.join(''), opt));
	    } else {
	      verse_dict[key] = REC.trim(REC.clean_verse_text(working.join(' '), opt));
	    }
	    order.push(key);
	  }
	  return [verse_dict, order];
	},

	extract_structure: function (text, opt) {
	    var lines, structure_list, line, i;
	    lines = REC.format_text(text, opt);
	    structure_list = [];
	    for (i = 0; i < lines.length; i += 1) {
		line = lines[i];
		if (line.length > 0 && line[0] === '|') {
		    if (opt['ignore_pagecolumn_layout'] === true && opt['ignore_linebreaks'] === true) {
			//only output book, chapter and verse markers
			if (line.search(REC.bookRegex) !== -1
				|| line.search(REC.chapterRegex) !== -1
				|| line.search(REC.verseRegex) !== -1) {
			    structure_list.push(REC.trim(line));
			}
		    } else {
			if (opt['ignore_pagecolumn_layout'] === true) {
			    //output book, chapter, verse and linebreak markers
			    if (line.search(REC.bookRegex) !== -1
				    || line.search(REC.chapterRegex) !== -1
				    || line.search(REC.verseRegex) !== -1
				    || line.search(REC.linebreakRegex) !== -1) {
				structure_list.push(REC.trim(line));
			    }
			} else {
			    if (opt['ignore_linebreaks'] === true) {
				//output book, chapter, verse, page, folio and column markers
				if (line.search(REC.bookRegex) !== -1
					|| line.search(REC.chapterRegex) !== -1
					|| line.search(REC.verseRegex) !== -1
					|| line.search(REC.folioRegex) !== -1
					|| line.search(REC.pageRegex) !== -1
					|| line.search(REC.columnRegex) !== -1) {
				    structure_list.push(REC.trim(line));
				}
			    } else {
				structure_list.push(REC.trim(line));
			    }
			}
		    }
		}
	    }
	    return structure_list;
	},

	getKeys: function (obj) {
	    var keys, key;
	    keys = [];
	    for (key in obj) {
	        if (obj.hasOwnProperty(key)) {
	            keys.push(key);
	        }
	    }
	    return keys;
	},

	unique: function (a) {
	    var i;
	    a.sort();
	    for (i = 1; i < a.length; ) {
	        if (a[i-1] === a[i]) {
	            a.splice(i, 1);
	        } else {
	            i += 1;
	        }
	    }
	    return a;
	},

	compareStrings: function (s1, s2) {
	    if (s1 === s2) {
		return '';
	    } else {
		return WDiffString(s1, s2);
	    }
	},

	toggle_checked: function (id) {
	    var checkboxes, i;
	    if (document.getElementById(id).innerHTML == 'Hide checked verses') {
		checkboxes = document.getElementsByName('marked');
		for (i = 0; i < checkboxes.length; i += 1) {
		    if (checkboxes[i].checked) {
			checkboxes[i].parentNode.style.display = 'none';
		    }
		}
		document.getElementById(id).innerHTML = 'Show hidden verses';
		REC.checkedState = 'hide';
	    } else {
		checkboxes = document.getElementsByName('marked');
		for (i = 0; i < checkboxes.length; i += 1) {
		    if (checkboxes[i].checked) {
			checkboxes[i].parentNode.style.display = 'block';
		    }
		}
		document.getElementById(id).innerHTML = 'Hide checked verses';
		REC.checkedState = 'show';
	    }
	},

	toggle_results: function (id, link_id) {
	    if (document.getElementById(id).style.display == 'none') {
		document.getElementById(id).style.display = 'block';
		document.getElementById(link_id).innerHTML = document.getElementById(link_id).innerHTML.replace('Show', 'Hide');
	    } else {
		if(document.getElementById(id).style.display == 'block') {
		    document.getElementById(id).style.display = 'none';
		    document.getElementById(link_id).innerHTML = document.getElementById(link_id).innerHTML.replace('Hide', 'Show');
		}
	    }
	},

	sort_keys: function (a, b) {
	    if (REC.sortorder.indexOf(a) !== -1 && REC.sortorder.indexOf(b) !== -1 ) {
		return REC.sortorder.indexOf(a) - REC.sortorder.indexOf(b);
	    }
	    if (REC.sortorder.indexOf(a) !== -1) {
		return 1;
	    }
	    return -1;
	},

	//this is the function that will be called by both online and offline reconcilers
	//all previous functions will go in a different file and be offline only
	//we will also need a flag to tell us where we are and then we can tailor other things to the environment
	//things saved may need to be different for example.
	compareFiles: function (s1, s2, opt) {
	    var list1, list2, outlineResult, temp1, temp2, dict1, dict2, order1, order2, compString1, compString2,
	    	keys, i, result, output;
	    document.getElementById('results_container').style.display = 'block';
	    list1 = REC.extract_structure(s1, opt);
	    list2 = REC.extract_structure(s2, opt);
	    outlineResult = REC.compareStrings(list1.join(' '), list2.join(' '));
	    document.getElementById('results_summary').innerHTML = 'Comparing <span id="file1_name" style="background: '
		+ REC.file1Background + ' color: ' + REC.file1TextColour + '"> ' + REC.file1.name
		+ ' </span> with <span id="file2_name" style="background:  ' + REC.file2Background
		+ ' color: ' + REC.file2TextColour + '"> ' + REC.file2.name + ' </span><br/>';
	    if (outlineResult == '') {
		document.getElementById('results_summary').innerHTML += 'Structures identical.<br/>';
	    } else {
		document.getElementById('results_summary').innerHTML += 'Structures are different.<br/>';
		document.getElementById('structure_results').innerHTML = outlineResult.replace(/\|K/g, '\<br/>|K');
		document.getElementById('structure_results_toggle').innerHTML += 'Show Structure Results';
	    }

	    temp1 = REC.extract_verse_text(s1, opt);
	    temp2 = REC.extract_verse_text(s2, opt);

	    dict1 = temp1[0];
	    dict2 = temp2[0];
	    order1 = temp1[1];
	    order2 = temp2[1];
	    compString1 = '';
	    compString2 = '';

	    if (document.getElementById('verse_order').value === 'file1order') {
		REC.sortorder = order1;
	    } else if (document.getElementById('verse_order').value === 'file2order') {
		REC.sortorder = order2;
	    } else {
		REC.sortorder = null;
	    }
	    REC.options.sortorder = document.getElementById('verse_order').value;
	    keys = REC.getKeys(dict1).concat(REC.getKeys(dict2));
	    keys = REC.unique(keys);
	    if (REC.sortorder !== null) {
		keys.sort(REC.sort_keys);
	    }
	    for (i = 0; i < keys.length; i += 1){
		if (dict1.hasOwnProperty(keys[i])){
		    compString1 = dict1[keys[i]];
		} else {
		    compString1 = '';
		}
		if (dict2.hasOwnProperty(keys[i])){
		    compString2 = dict2[keys[i]];
		} else {
		    compString2 = '';
		}
		result = REC.compareStrings(compString1, compString2);
		if (result !== ''){
		    REC.results[keys[i]] = '<input size="100" type="text" name="comments" onchange="REC.update(this);"/><br/><input name="marked" type="checkbox" onchange="REC.update(this)"/>' + result;
		}
	    }
	    output = '<input onchange="javascript:REC.toggleAll(this);" type="checkbox"><label>select/deselect all</label><a id="toggle_checked" href="javascript:REC.toggle_checked(\'toggle_checked\')">Hide checked verses</a><br/>';
	    keys = REC.getKeys(REC.results);
	    if (keys.length == 0){
		document.getElementById('results_summary').innerHTML += 'Biblical text identical.<br/>';
	    } else {
		for (i = 0; i < keys.length; i += 1){
		    output = output + '<div class="verse_comp">' +  REC.format_BKV(keys[i]) + ' ' + REC.results[keys[i]] + '</div>';
		}
		document.getElementById('results_summary').innerHTML += keys.length + ' Biblical verses have differences.<br/>';
		document.getElementById('text_results').innerHTML = output;
		document.getElementById('text_results_toggle').innerHTML = 'Show Text Results';
	    }
	},

	format_BKV: function (key) {
	    var KV, K, V;
	    if (key.indexOf('_') !== -1) {
		KV = key.split('_')[1].split(':');
		K = KV[0];
		V = KV[1];
		if (K[0] === '0') {
		    K = K.slice(1);
		}
		if (V[0] === '0') {
		    V = V.slice(1);
		}
		return K + ':' + V;
	    } else {
		return key;
	    }
	},

	parse_XML: function (xml) {
	    var xmlDoc, parser;
	    try {
		xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
		xmlDoc.async = "false";
		xmlDoc.loadXML(xml);
	    } catch(e) {
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(xml,"text/xml");
	    }
	    return xmlDoc;
	},

	//try to get a valid dom by correcting once for a known bug in the diff.js library
	get_dom: function (string) {
	    var xmlDoc;
	    xmlDoc = REC.parse_XML(string);
	    if (xmlDoc.documentElement.nodeName=="parsererror") {
		xmlDoc = REC.parse_XML(string.replace(/<\/container>/, '</span></container>'));
		if (xmlDoc.documentElement.nodeName=="parsererror"){
		    return false;
		} else {
		    return xmlDoc;
		}
	    } else {
		return xmlDoc;
	    }
	},

	//given a difference node find the full word that contains it. Stop at space and ] or [
	get_word_limits: function (startNode) {
	    var following_text, preceding_text, following, previous;
	    //remove outer if statements for a word of context on one side of a full word change
	    following_text = '';
	    preceding_text = '';
	    if ((startNode.childNodes[0].nodeValue[0] != ' '
		&& startNode.childNodes[0].nodeValue[0] != '[')
		    || ((startNode.childNodes[0].nodeValue[0] == ' '
			|| startNode.childNodes[0].nodeValue[0] == '[')
			    && startNode.childNodes[0].nodeValue.length == 1)){
		if (startNode.previousSibling != null && startNode.previousSibling.nodeType === 3){
		    previous = startNode.previousSibling;
		    if (previous.nodeValue[previous.nodeValue.length-1] !== ' '
			&& previous.nodeValue[previous.nodeValue.length-1] !== ']'){
			preceding_text = previous.nodeValue.split(' ');
			preceding_text = preceding_text[preceding_text.length-1];
			preceding_text = preceding_text.substring(preceding_text.lastIndexOf(']')+1);
		    }
		}
	    }
	    if ((startNode.childNodes[0].nodeValue[startNode.childNodes[0].nodeValue.length-1] != ' '
		&& startNode.childNodes[0].nodeValue[startNode.childNodes[0].nodeValue.length-1] != ']')
		    || ((startNode.childNodes[0].nodeValue[startNode.childNodes[0].nodeValue.length-1] == ' '
			|| startNode.childNodes[0].nodeValue[startNode.childNodes[0].nodeValue.length-1] == ']')
			    && startNode.childNodes[0].nodeValue.length == 1)){
		if (startNode.nextSibling != null && startNode.nextSibling.nodeType === 3){
		    following = startNode.nextSibling;
		    if (following.nodeValue[0] !== ' ' && following.nodeValue[0] !== '['){
			following_text = following.nodeValue.split(' ')[0];
			if (following_text.indexOf('[') !== -1){
			    following_text = following_text.substring(0, following_text.indexOf('['));
			}
		    }
		}
	    }
	    return [preceding_text, following_text];
	},

	//create a list of differences from this verse
	//input: the html string of a verse from the text results view
	//output: a 2 item list per difference all wrapped up in another list
	process_diffs: function (string) {
	    var differences, i, xmlDoc, spans, spanType, surrounding_text, last_span, first_span, pre_string,
	    	post_string, text1, text2;
	    differences = [];
	    text1_string = '';
	    text2_string = '';
	    xmlDoc = REC.get_dom(string);
	    if (xmlDoc === false){
		console.log(REC.parse_XML(string));
	    } else {
		spans = xmlDoc.getElementsByTagName('span');
		for (i = 0; i < spans.length; i += 1) {
		    //treat as stand alone variant IF:
		    // the nextSibling is not a span
		    // OR
		    // the nextSibling is a span AND the current span ends with a space OR the next span starts with a space
		    // OR
		    // there is no nextSibling
		    if ((spans[i].nextSibling != null && spans[i].nextSibling.nodeName !== 'span')
			    || (spans[i].nextSibling != null && spans[i].nextSibling.nodeName == 'span'
				&& (spans[i].childNodes[0].nodeValue[spans[i].childNodes[0].nodeValue.length-1] == ' '
				    || spans[i].nextSibling.childNodes[0].nodeValue[0] == ' '))
				|| spans[i].nextSibling == null) {
			//examples like GK 1:18 could be better
			spanType = spans[i].getAttribute('class');
			if (spanType === 'wDiffHtmlDelete') {
			    surrounding_text = REC.get_word_limits(spans[i]);
			    if (surrounding_text[0] !== '' || surrounding_text[1] !== '') {
				differences.push([surrounding_text[0] + spans[i].childNodes[0].nodeValue
				                  + surrounding_text[1], surrounding_text[0] + surrounding_text[1]]);
			    } else {
				differences.push([spans[i].childNodes[0].nodeValue, '[BLANK]']);
			    }
			} else {
			    if (spanType === 'wDiffHtmlInsert') {
				surrounding_text = REC.get_word_limits(spans[i]);
				if (surrounding_text[0] !== '' || surrounding_text[1] !== '') {
				    differences.push([surrounding_text[0] + surrounding_text[1], surrounding_text[0]
				    		+ spans[i].childNodes[0].nodeValue + surrounding_text[1]]);
				} else {
				    differences.push(['[BLANK]', spans[i].childNodes[0].nodeValue]);
				}
			    }
			}
		    } else {
			text1_string = '';
			text2_string = '';
			first_span = spans[i];
			last_span = null;
			spanType = spans[i].getAttribute('class');
			if (spanType === 'wDiffHtmlDelete') {
			    text1_string += spans[i].childNodes[0].nodeValue;
			} else {
			    if (spanType === 'wDiffHtmlInsert') {
				text2_string += spans[i].childNodes[0].nodeValue;
			    }
			}
			while (spans[i].nextSibling !== null && spans[i].nextSibling.nodeName === 'span') {
			    spanType = spans[i].nextSibling.getAttribute('class');
			    if (spanType === 'wDiffHtmlDelete') {
				text1_string += spans[i].nextSibling.childNodes[0].nodeValue;
			    } else {
				if (spanType === 'wDiffHtmlInsert') {
				    text2_string += spans[i].nextSibling.childNodes[0].nodeValue;
				}
			    }
			    last_span = spans[i].nextSibling;
			    i += 1;
			}
			pre_string = REC.get_word_limits(first_span);
			post_string = REC.get_word_limits(last_span);
			if (text1_string === '') {
			    text1_string ='[BLANK]';
			}
			if (text2_string === ''){
			    text2_string = '[BLANK]';
			}
			differences.push([pre_string[0] + text1_string + post_string[1], pre_string[0]
					+ text2_string + post_string[1]]);
			//spaces in both strings need to be taken into account for pre/post string
		    }
		}
	    }
	    return differences;
	},

	saveText: function () {
	    var newwindow1, tmp, keys, counter, i, j, string, diffs;
	    newwindow1 = open('','name','height=200,width=150,scrollbars=yes');
	    tmp = newwindow1.document;
	    keys = REC.getKeys(REC.results);
	    counter = 1;
	    tmp.write(document.getElementById('file1_name').innerHTML);
	    tmp.write('&nbsp;&nbsp;&nbsp;]&nbsp;&nbsp;&nbsp;');
	    tmp.write(document.getElementById('file2_name').innerHTML);
	    tmp.write('<br/>');
	    tmp.write('<br/>');
	    for (i = 0; i < keys.length; i += 1) {
		tmp.write(REC.format_BKV(keys[i]) + '<br/>');
		string = REC.results[keys[i]].replace(/&nbsp;/g, ' ');
		diffs = REC.process_diffs('<container>' + string + '</container>');
		for (j = 0; j < diffs.length; j += 1) {
		    tmp.write(counter + '.&nbsp;&nbsp;');
		    tmp.write(diffs[j][0]);
		    tmp.write('&nbsp;&nbsp;&nbsp;]&nbsp;&nbsp;&nbsp;');
		    tmp.write(diffs[j][1]);
		    tmp.write('<br/>');
		    counter += 1;
		}
		tmp.write('<br/>');
	    }
	    tmp.close();
	},

	saveReconciliation: function () {
	    var textString, newwindow2, tmp;
	    //option 3 - put serialisation in popup window for users to copy and paste into a file
	    textString = escape(document.getElementById('results_summary').innerHTML)
	    		+ '|||' + escape(document.getElementById('structure_results').innerHTML)
	    		+ '|||' + escape(document.getElementById('text_results').innerHTML);
	    newwindow2 = open('','name','height=200,width=150,scrollbars=yes');
	    tmp = newwindow2.document;
	    tmp.write(textString);
	    tmp.write('|||' + escape(JSON.stringify(REC.results)));
	    tmp.write('|||' + escape(JSON.stringify(REC.options)));
	    tmp.close();
	},

	toggleAll: function (elem) {
	    var boxes, i;
	    boxes = document.getElementsByName('marked');
	    if (elem.checked){
		elem.setAttribute('checked', 'checked');
		for (i = 0; i < boxes.length; i +=1 ) {
		    boxes[i].checked = true;
		    boxes[i].setAttribute('checked', 'checked');
		    REC.update(boxes[i]);
		}
	    } else {
		elem.removeAttribute('checked');
		for (i = 0; i < boxes.length; i += 1) {
		    boxes[i].checked = false;
		    boxes[i].removeAttribute('checked');
		    REC.update(boxes[i]);
		}
	    }
	},

	update: function (elem) {
	    if (elem.type === 'checkbox') {
		if (elem.checked) {
		    elem.setAttribute('checked', 'checked');
		    if (REC.checkedState === 'hide') {
			elem.parentNode.style.display = 'none';
		    }
		} else {
		    elem.removeAttribute('checked');
		    if (REC.checkedState === 'hide') {
			elem.parentNode.style.display = 'block';
		    }
		}
	    } else {
		elem.setAttribute('value', elem.value);
	    }
	},

	uploadReconciliation: function () {
	    var f, reader, body;
	    f = document.getElementById('reconciliation').files[0];
	    reader = new FileReader();
	    body = document.getElementsByTagName('body')[0];
	    body.className = 'waiting';
	    document.getElementById('results_container').style.display = 'none';
	    document.getElementById('text_results').style.display = 'none';
	    document.getElementById('structure_results').style.display = 'none';
	    document.getElementById('text_results_toggle').innerHTML = '';
	    document.getElementById('structure_results_toggle').innerHTML = '';
	    REC.file1 = null;
	    REC.file2 = null;
	    REC.file1String = '';
	    REC.file2String = '';
	    document.getElementById('file1_details').innerHTML = '';
	    document.getElementById('file2_details').innerHTML = '';
	    reader.onload = ( function () {
		return function (evt){
		    var fullString, stringList, summaryString, structureString, textString;
		    fullString = evt.target.result;
		    stringList = fullString.split('|||');
		    summaryString = stringList[0];
		    structureString = stringList[1];
		    textString = stringList[2];
		    REC.results = JSON.parse(unescape(stringList[3]));
		    REC.options = JSON.parse(unescape(stringList[4]));
		    document.getElementById('compare_button').disabled = "disabled";
		    document.getElementById('results_summary').innerHTML = unescape(summaryString);
		    document.getElementById('structure_results').innerHTML = unescape(structureString);
		    document.getElementById('text_results').innerHTML = unescape(textString);
		    document.getElementById('results_container').style.display = 'block';
		    document.getElementById('structure_results_toggle').innerHTML = 'Show Structure Results';
		    document.getElementById('text_results_toggle').innerHTML = 'Show Text Results';
		    // in here get options used for reconciliation right!
		    for (var key in REC.options){
			if (key === 'sortorder') {
			    document.getElementById('verse_order').value = REC.options[key];
			} else {
			    document.getElementById(key).checked = REC.options[key];
			}
		    }
		    body.className = 'active';
		};
	    }());
	    reader.readAsText(f);
	},

	loadXMLDoc: function (dname) {
	    var xhttp;
	    if (window.XMLHttpRequest) {
	        xhttp = new XMLHttpRequest();
	    }
	    else {
	        xhttp = new ActiveXObject('Microsoft.XMLHTTP');
	    }
	    xhttp.open('GET', dname, false);
	    xhttp.send('');
	    return xhttp.responseXML;
	},

	loadXMLString: function (txt) {
	    var parser, xmlDoc;
	    if (window.DOMParser) {
		parser = new DOMParser();
		xmlDoc = parser.parseFromString(txt, 'text/xml');
	    } else { // Internet Explorer
		xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
		xmlDoc.async = false;
		xmlDoc.loadXML(txt);
	    }
	    return xmlDoc;
	},

	readFiles: function(ignore_structure) {
	  var reader1, reader2, body, xsl;
	  reader1 = new FileReader();
	  reader2 = new FileReader();
	  body = document.getElementsByTagName('body')[0];

	  if (REC.file1 == null || REC.file2 == null) {
	    alert('Please select two files before continuing.');
	  } else if (REC.file1.type !== REC.file2.type) {
	    alert('file types must match to compare.');
	  } else {
	    body.className = 'waiting';
	    document.getElementById('reconciliation').value = '';
	    document.getElementById('results_container').style.display = 'none';
	    document.getElementById('text_results').style.display = 'none';
	    document.getElementById('structure_results').style.display = 'none';
	    document.getElementById('text_results_toggle').innerHTML = '';
	    document.getElementById('structure_results_toggle').innerHTML = '';

	    REC.options['ignore_pagecolumn_layout'] = document.getElementById('ignore_pagecolumn_layout').checked;
	    REC.options['ignore_linebreaks'] = document.getElementById('ignore_linebreaks').checked;
	    REC.options['ignore_comments'] = document.getElementById('ignore_comments').checked;
	    REC.options['ignore_tags'] = document.getElementById('ignore_tags').checked;
	    REC.options['ignore_final_nu'] = document.getElementById('ignore_final_nu').checked;
	    REC.options['ignore_punctuation'] = document.getElementById('ignore_punctuation').checked;
	    REC.options['ignore_comment_om'] = document.getElementById('ignore_comment_om').checked;
	    REC.options['ignore_comment_comm'] = document.getElementById('ignore_comment_comm').checked;
	    REC.options['ignore_comment_lect'] = document.getElementById('ignore_comment_lect').checked;
	    REC.options['ignore_parenthesis'] = document.getElementById('ignore_parenthesis').checked;
	    REC.options['ignore_status_note'] = document.getElementById('ignore_status_note').checked;
	    REC.options['ignore_entities'] = document.getElementById('ignore_entities').checked;

	    reader2.onload = (function(theText) {
	      return function(evt) {
	        REC.file2String = evt.target.result;
	        if (REC.file1.type === 'text/xml') {
	          REC.mode = 'xml';
            xsl = REC.loadXMLDoc("reconciler.xsl");
	          file1xml = REC.loadXMLString(REC.file1String);
	          file2xml = REC.loadXMLString(REC.file2String);
	          if (window.ActiveXObject) {
	            REC.file1String = file1xml.transformNode(xsl);
	            REC.file2String = file2xml.transformNode(xsl);
	          } else {
	            xsltProcessor = new XSLTProcessor();
	            xsltProcessor.importStylesheet(xsl);
	            REC.file1String = xsltProcessor.transformToFragment(file1xml, document);
	            REC.file2String = xsltProcessor.transformToFragment(file2xml, document);
	          }
	          REC.compareFiles(REC.file1String.textContent, REC.file2String.textContent, REC.options);
	        } else {
	          REC.compareFiles(REC.file1String, REC.file2String, REC.options);
	        }

	        body.className = 'active';
	      };
	    }(REC.file2String));

	    reader1.onload = (function(theText) {
	      return function(evt) {
	        REC.file1String = evt.target.result;
	        reader2.readAsText(REC.file2);
	      };
	    }(REC.file1String));

	    reader1.readAsText(REC.file1);
	  }
	},


    };
}());
