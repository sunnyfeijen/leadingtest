$(document).ready(function() {

  $('.block').each(function(i) {

    var type = $(this).attr('type');

    if( type == 'textflow' ){
      blockFormat(this);
    }

    if( type == 'tabflow' ){
      //tabFormat(this);
      // tabFormatInit(tabBlock, tabString);
    }

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



  var block = $('#block2');
  var string = '<font fontname="Herculanum" fontsize="60" alignment="left" leading="70" fillcolor="{ cmyk 0,0,0,1 }" >Honing</font><font fontname="AmericanTypewriter" alignment="left" fontsize="24" leading="30" fillcolor="30" ><nextline />in knijpfles bijvoorbeeld:</font>';

  var tabBlock = $('#block3');
  var tabString = '<font fontname="AmericanTypewriter" fontsize="20" leading="40" fillcolor="{ cmyk 0 0 0 1 }" alignment="left" >Jonge kaas platstuk 50+</font>\t<font fontname="AmericanTypewriter" fontsize="20" leading="40" fillcolor="{ cmyk 0 0 0 1 }" alignment="left" ></font>\t<font fontname="AmericanTypewriter" fontsize="20" leading="40" fillcolor="{ cmyk 0 0 0 1 }" alignment="left" class=schrapprijs>5.75</font>\t<font fontname="VeneerW01-Two" fontsize="40" leading="20" fillcolor="cmyk { 0 0 0 1 }" alignment="left" >4.99</font>\n<font fontname="AmericanTypewriter" fontsize="20" leading="40" fillcolor="{ cmyk 0 0 0 1 }" alignment="left" >Jong belegen platstuk 50+</font>\t<font fontname="AmericanTypewriter" fontsize="20" leading="40" fillcolor="{ cmyk 0 0 0 1 }" alignment="left" ></font>\t<font fontname="AmericanTypewriter" fontsize="20" leading="40" fillcolor="{ cmyk 0 0 0 1 }" alignment="left" class=schrapprijs>6.49</font>\t<font fontname="VeneerW01-Two" fontsize="40" leading="20" fillcolor="cmyk { 0 0 0 1 }" alignment="left" >5.49</font>\n<font fontname="AmericanTypewriter" fontsize="20" leading="40" fillcolor="{ cmyk 0 0 0 1 }" alignment="left" >Belegen kaas platstuk 50+</font>\t<font fontname="AmericanTypewriter" fontsize="20" leading="40" fillcolor="{ cmyk 0 0 0 1 }" alignment="left" ></font>\t<font fontname="AmericanTypewriter" fontsize="20" leading="40" fillcolor="{ cmyk 0 0 0 1 }" alignment="left" class=schrapprijs>6.99</font>\t<font fontname="VeneerW01-Two" fontsize="40" leading="20" fillcolor="cmyk { 0 0 0 1 }" alignment="left" >5.99</font>\n<font fontname="AmericanTypewriter" fontsize="20" leading="40" fillcolor="{ cmyk 0 0 0 1 }" alignment="left" >Oude kaas platstuk 50+</font>\t<font fontname="AmericanTypewriter" fontsize="20" leading="40" fillcolor="{ cmyk 0 0 0 1 }" alignment="left" ></font>\t<font fontname="AmericanTypewriter" fontsize="20" leading="40" fillcolor="{ cmyk 0 0 0 1 }" alignment="left" class=schrapprijs>7.99</font>\t<font fontname="VeneerW01-Two" fontsize="40" leading="20" fillcolor="cmyk { 0 0 0 1 }" alignment="left" >6.99</font>';

  formatInit(block, string);

  function formatInit(element, value){

    var type = $(element).attr('type');

    if( type == 'textflow' ){
      var container = $(element).find('.container');

      $(value).each(function(){

        $(container).append(this);

      });

      $(element).find('font').attr('contenteditable', 'true');

      blockFormat(element);
    }

  }



  function formatOutput(element){

    var output = '';

    $(element).find('font').each(function(){

      var clone = $(this).clone();
      $(clone).removeAttr('contenteditable');
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


  $('.output').on('click', function() {
    formatOutput( $('#block2') );
  });

  $('font').on('focusout', function() {

    // console.log('asd');
    removeNestedSpan(this);
    removeBr(this);

    //update leading
    var index = $(this).prevAll('font').length;
    setLeading(this, index);

  });

  $('.block').each(function(){

    var editable = $(this).attr('editable');
    var type = $(this).attr('type');

    if(editable){
      makeEditable( $(this) );
    }

    if( type == 'tabflow' && editable ){
      var font = $(this).find('font');
      makeEditable( font );
    }

  });






  //////////// TABFLOW \\\\\\\\\\\\\\

  tabFormatInit(tabBlock, tabString);

  function tabFormatInit(element, value){

    var type = $(element).attr('type');
    if( type == 'tabflow' ){

      var rows = value.split("\n");
      var tabs = [];

      //foreach row
      for (var i = 0; i < rows.length; i++) {
        tabs[i] = rows[i].split("\t");
        rows[i] = tabs[i];

        //foreach tab in row
        for (var tab = 0; tab < tabs.length; tab++) {

          //console.log(i);
          //console.log(tab);

        }


      }

      for (var i = 0; i < rows.length; i++) {
        // append row
        $(element).find('.container').append("<div class='tabs-row'></div>");
      }

      var index = 0;
      $(element).find('.tabs-row').each(function(){

        for (var i = 0; i < rows[index].length; i++) {
          //append tabs
          $(this).append("<div class='tabs-tab'>"+rows[index][i]+"</div>");
        }

        index++;
      });


      tabFormat(element);

    }

  }

  function tabFormat(element){

    var width = '550pt';
    var tabOptions = ['0', '260', '300', '440'];
    $(element).css('width', width);

    $(element).find('.tabs-row').each(function(){

      var length = $(this).find('.tabs-tab').length;
      $(this).find('font').each(function(i){

        var alignment = $(this).attr('alignment');
        if( alignment == '' || typeof alignment === 'undefined' ){
          alignment = 'left';
        }

        if( alignment == 'center' ){
          $(this).css('transform', 'translateX(-50%)');
          $(this).css('text-align', 'center');
        }

        if( alignment == 'right' ){
          $(this).css('transform', 'translateX(-100%)');
          $(this).css('text-align', 'right');
        }

        if( i+1 < length ){
          var width = tabOptions[i+1] - tabOptions[i];
        }
        if( i+1 == length ){
          var width = 'auto';
        }





        $(this).css('width', width+'pt');
        setFont(this);


      })


    });

    //console.log(element);

  };


  $('.taboutput').on('click', function() {
    formatTabOutput( $('#block3') );
  });


  function formatTabOutput(element){

    var output = '';
    var rowIndex = 1;
    var rowLength = $(element).find('.tabs-row').length;
    $(element).find('.tabs-row').each(function(){

      var clone = $(this).clone();
      var rowValue = '';
      var tabIndex = 1;
      var tabLength = $(clone).find('.tabs-tab').length;
      $(clone).find('font').each(function(){

        $(this).removeAttr('contenteditable');
        $(this).removeAttr('style');

        var tabValue = $(this)[0].outerHTML;

        if( tabIndex < tabLength ){
          tabValue += '\\t';
        }

        rowValue += tabValue;
        tabIndex++;
      });

      if( rowIndex < rowLength ){
        rowValue += '\\n';
      }

      output += rowValue;
      rowIndex++;

    });

    console.log('output:');
    console.log(output);

  }



});
