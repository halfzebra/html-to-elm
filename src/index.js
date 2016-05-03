var htmlparser = require('htmlparser');
var ace = require('brace');
require('brace/mode/html');
require('brace/mode/elm');
require('brace/theme/monokai');

var elmHtmlAttributes = {
  'class': '',
  'href': ''
};

var rawHtml = [
  '<div class="row-fluid entry-filter-btn">',
  '  <div class="pull-right">',
  '    <a href="#" class="btn" data-action="clearFilters">Ryd</a>',
  '    <a href="#" class="btn btn-info" data-action="applyFilters">OK</a>',
  '  </div>',
  '</div>'
].join('\n');

var htmlEditor = ace.edit('html-editor');
htmlEditor.getSession().setMode('ace/mode/html');
htmlEditor.setTheme('ace/theme/monokai');
htmlEditor.setValue(rawHtml);

htmlEditor.on('input', function () {
  parser.parseComplete(htmlEditor.getSession().getValue());
});

var elmEditor = ace.edit('elm-editor');
elmEditor.getSession().setMode('ace/mode/elm');
elmEditor.setTheme('ace/theme/monokai');

var handler = new htmlparser.DefaultHandler(function (error, dom) {
  if (error) {
    console.log(error);
  } else {
    console.log(dom);
    elmEditor.setValue(tagToElm(dom.filter(filterEmptyTextNode)[ 0 ]));
  }
});

function filterEmptyTextNode (node) {
  return node[ 'type' ] !== 'text' && node[ 'data' ].trim() !== 0;
}

var parser = new htmlparser.Parser(handler);
parser.parseComplete(rawHtml);

function tagToElm (astData) {

  var type = astData[ 'type' ];
  var children = astData[ 'children' ];
  var attribs = astData[ 'attribs' ];
  var name = astData[ 'name' ];

  switch (type) {
    case 'tag':
      var elmEl = [];
      var elmAttrs = [];
      var attribsKeys = Object.keys(attribs);

      elmEl.push(name);

      if (attribsKeys.length > 0) {
        attribsKeys.forEach(function (key) {
          if (key in elmHtmlAttributes) {
            elmAttrs.push(key + ' ' + '"' + attribs[ key ] + '"')
          } else {
            // handle custom attributes.
          }
        });
        elmEl.push('[ ' + elmAttrs.join(', ') + ']');
      } else {
        elmEl.push('[]');
      }

      if (typeof children !== 'undefined' && children.length > 0) {
        var elmChildren = [];
        children.forEach(function (val) {
          elmChildren.push(tagToElm(val));
        });
        elmEl.push('[' + elmChildren.join(', ') + ']');
      } else {
        elmEl.push('[]');
      }

      return elmEl.join(' ');
      break;

    case 'text':
      var data = astData[ 'data' ];

      return 'text "' + data + '"';
      break;

    default:
      return '{- not supported node type -}';
      break;
  }
}

