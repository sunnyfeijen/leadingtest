$(document).ready(function() {

  $('.block').each(function(i) {

    blockFormat(this);

  });


  function blockFormat(element){

    verticalAlign(element);


    // set paragraph options
    var length = $(element).find('p').length;
    $(element).find('p').each(function(i) {

      fontLoad(this, length, i);
      setFont(this);
      wrapLines(this);
      removeBr(this);
      setLeading(this, i);
    });

    $(element).find('font').each(function(i) {

      horizontalAlign(this);
      fontLoad(this, length, i);
      setFont(this);
      wrapLines(this);
      removeBr(this);
      setLeading(this, i);
      formatNextline(this);
    });

  }


  function verticalAlign(element){

    // set vertical align
    var vertical_align = $(element).attr('vertical-align');
    if( vertical_align == '' || typeof vertical_align === 'undefined' ){
      vertical_align = 'top';
    }

    if( vertical_align == 'top'){
      $(element).css("align-items", "flex-start");
    }

    if( vertical_align == 'center'){
      $(element).css("align-items", "center");
    }

    if( vertical_align == 'bottom'){
      $(element).css("align-items", "flex-end");
    }
  }

  function horizontalAlign(element){
    // set horizontal align
    var alignment = $(element).attr('alignment');
    if( alignment == '' || typeof alignment === 'undefined' ){
      alignment = 'left';
    }

    if( alignment == 'left'){
      $(element).css("justify-self", "flex-start");
      $(element).css("text-align", "left");
    }

    if( alignment == 'center'){
      $(element).css("justify-self", "space-around");
      $(element).css("text-align", "center");
    }

    if( alignment == 'right'){
      $(element).css("justify-self", "flex-end");
      $(element).css("text-align", "right");
    }
  }


  function fontLoad(element, length, i) {

    var fonts_folder = 'fonts/';
    var font_family = $(element).attr('fontname');
    var font_path = fonts_folder+font_family;

    const opentype = require("opentype.js")

    var fontObj = opentype.load(font_path+'.ttf', function(err, font) {
      if (err) {
          console.log('Could not get metrics from ' + font_family + ' -> ' + err);
      } else {
        compensateLeading(element, font, err, length, i)
        console.log(font_family+' metrics loaded');
      }
    });

  }

  function setFont(element) {

    // set font-family
    var fontFamily = $(element).attr('fontname');
    $(element).css("font-family", fontFamily);

    // set font size
    var fontSize = $(element).attr('fontsize')+'pt';
    $(element).css("font-size", fontSize);

  }

  function compensateLeading(element, font, err, length, i) {
    //todo compensate leading for alignment

    if(!err){

      var emUnits = font.unitsPerEm;
      var ascender = font.tables.os2.sTypoAscender;
      var descender = font.tables.os2.sTypoDescender;
      var ascenderNormalized = ascender / emUnits
      var descenderNormalized = descender / emUnits


      if( window.navigator.platform.includes('win') !== -1 ){
        // for Windows
        var winAscent = font.tables.os2.usWinAscent;
        var winDescent = font.tables.os2.usWinDescent;
        ascenderNormalized = (winAscent / emUnits);
        descenderNormalized = (winDescent / emUnits) * -1;

      }
      if( window.navigator.platform.includes('mac') !== -1 ){
        // for Mac
        var hheadAscent = font.tables.hhea.ascender;
        var hheadDescent = font.tables.hhea.descender;
        ascenderNormalized = (hheadAscent / emUnits);
        descenderNormalized = (hheadDescent / emUnits);
      }


      var fontsize = $(element).attr('font-size');

      var vertical_align = $(element).closest('.block').attr('vertical-align');
      if( vertical_align == 'bottom' && i == (length -1) ){
        // aligned bottom and last paragraph

        if( fontsize != '' && typeof fontsize != 'undefined' ){

          var compensation = fontsize * descenderNormalized;
          $(element).css("margin-bottom", compensation+'pt');

        }

      }

    }

  }

  function wrapLines(element){

    var spanInserted = $(element).html().split(" ").join(" </span><span>");
    var wrapped = ("<span>").concat(spanInserted, "</span>");
    $(element).html(wrapped);
    var refPos = $(element).children('span').first().position().top;
    var newPos;

    //console.log( $(element).html() );

    $(element).find('span').each(function(index) {
        newPos = $(this).position().top;
        $(this).addClass('line');
        if (index == 0){
           return;
        }
        if (newPos == refPos){

            var firstChild = $(this).prev()[0].firstChild.nodeName;
            if( firstChild != null && firstChild == 'NEXTLINE' ){
              $(element).prepend( '<nextline></nextline>' );
            }

            $(this).prepend($(this).prev().text() + " ");
            $(this).prev().remove();
        }
        refPos = newPos;
    });

  }

  function setLeading(element, index) {

    var fontSize = $(element).attr('fontsize');
    var leading = $(element).attr('leading');
    leading = leading - fontSize;
    if( leading < 0 ){
      leading = 0;
    }


    $(element).find('.line').each(function(i) {

      $(this).css("display", "block");
      if( index == 0 && i == 0 ){
        return
      }

      if( leading != '' && typeof leading != 'undefined' ){
        $(this).css("margin-top", leading+ 'pt');
      }


    })

  }

  function removeNestedSpan(element){

      $(element).children('.line').each(function(){

        var length = $(this).children('span').length;
        if( length > 0 ){

          $(this).children('span').each(function(){

            var text = $(this).html();
            $(this).before(text);
            $(this).remove();

          })

          //combine childnodes
          $(this)[0].normalize();
        }

      })

    }

  function removeBr(element){

    $(element).children('.line').each(function(){

      var children = $(this)[0].childNodes;

      for (var i = 0; i < children.length; i++) {

        var text = '';
        var nextSibling = children[i].nextSibling;
        var element = this;

        //console.log( children[i] );

        // if nodetype is text
        if( children[i].nodeType === 3 ){
            var text = children[i].nodeValue;
            var newElement = $(element).clone();

            // Merge multiple successive text nodes
            if( nextSibling != null && nextSibling.nodeType === 3 && text != '' ){
              text = text + nextSibling.nodeValue
              i++;
            }

            $(newElement).html('').html(text);
            $(element).before( newElement );
        }

        // if Next sibling is <br>
        if( nextSibling != null && nextSibling.nodeType === 1 && text != '' ){
          //$(element).before('<nextline>');
        }

      }

      $(this).remove();

    });

  }

  function formatNextline(element){

    $(element).find('nextline').each(function(){

      var clone = $(this).next('.line').clone().html('&nbsp').addClass('nextline');
      $(this).before( clone );
      $(this).remove();

    });

  }




    $('p').on('focusout', function() {

      removeNestedSpan(this);
      removeBr(this);

      //update leading
      var index = $(this).prevAll('p').length;
      setLeading(this, index);

    });


  $('.block').each(function(){

    var editable = $(this).attr('editable');

    if(editable){
      makeEditable( $(this) );
    }

  });


  var block2 = $('#block2');
  var string = '<font fontname="Herculanum" fontsize="60" alignment="left" leading="70" fillcolor="{ cmyk 0,0,0,1 }" >Honing</font><font fontname="AmericanTypewriter" alignment="left" fontsize="24" leading="30" fillcolor="30" ><nextline />in knijpfles bijvoorbeeld:</font>';

  formatInit(block2, string);

  function formatInit(element, value){

    var container = $(element).find('.container');

    console.log( value );
    $(string).each(function(){

      $(container).append(this);

    })

    blockFormat(element);


  }



  $('.output').on('click', function() {
    formatOutput( $('#block2') );
  });

  function formatOutput(element){

    var output = '';

    $(element).find('font').each(function(){

      var clone = $(this).clone();
      $(clone).removeAttr('style');

      var fontValue = '';

      $(clone).find('.line').each(function(){

        var lineValue = $(this)[0].innerHTML;

        if( $(this)[0].innerHTML == '&nbsp;' ){
          lineValue = '<nextline />';
        }

        fontValue += lineValue.replace(/ +(?= )/g,'');


      });

      $(clone).html(fontValue);

      output += $(clone)[0].outerHTML

    });

    console.log('output:');
    console.log(output);

  }




});
