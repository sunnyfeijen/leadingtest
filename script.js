$(document).ready(function() {

  $('.block').each(function(i) {

    // set vertical align
    var vertical_align = $(this).attr('vertical-align');
    if( vertical_align == '' || typeof vertical_align === 'undefined' ){
      vertical_align = 'top';
    }

    if( vertical_align == 'top'){
      $(this).css("align-items", "flex-start");
    }

    if( vertical_align == 'center'){
      $(this).css("align-items", "center");
    }

    if( vertical_align == 'bottom'){
      $(this).css("align-items", "flex-end");
    }



    // set horizontal align
    var align = $(this).attr('align');
    if( align == '' || typeof align === 'undefined' ){
      align = 'left';
    }

    if( align == 'left'){
      $(this).css("justify-content", "flex-start");
    }

    if( align == 'center'){
      $(this).css("justify-content", "space-around");
      $(this).css("text-align", "center");
    }

    if( align == 'right'){
      $(this).css("justify-content", "flex-end");
    }


    // set paragraph options
    var length = $(this).find('p').length;
    $(this).find('p').each(function(i) {

      fontLoad(this, length, i);
      setFont(this);
      wrapLines(this);

      setLeading(this, i);

      //set leading
      // var leading = $(this).attr('leading')+ 'pt';
      //
      // if( vertical_align == 'top' ){
      //   //remove leading from top line
      //   if( leading != '' && typeof leading != 'undefined' && i == 0 ){
      //
      //   }
      //
      //   if( leading != '' && typeof leading != 'undefined' && i != 0 ){
      //     // $(this).css("margin-top", leading);
      //     setLeading( this );
      //   }
      // }
      //
      //
      //
      // if( vertical_align == 'bottom'){
      //   //align baseline with bottom
      //
      //   if( leading != '' && typeof leading != 'undefined' && i != (length -1) ){
      //     setLeading( this );
      //   }
      //
      //   if( leading != '' && typeof leading != 'undefined' && i == (length -1) ){
      //     setLeading( this );
      //     //compensateLeading( this );
      //   }
      //
      // }


    });

  });





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
    var fontSize = $(element).attr('font-size')+'pt';
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

    $(element).find('span').each(function(index) {
        newPos = $(this).position().top;
        $(this).addClass('line');
        if (index == 0){
           return;
        }
        if (newPos == refPos){
            $(this).prepend($(this).prev().text() + " ");
            $(this).prev().remove();
        }
        refPos = newPos;
    });

  }

  function setLeading(element, index) {

    var fontSize = $(element).attr('font-size');
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



    $('p').on('focusout', function() {

      removeNestedSpan(this);

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

  function makeEditable(element){


    // var quill = new Quill( $(element)[0], {
    //   theme: 'snow'
    // });
    //
    // quill.setText('Gandalf the Grey');

  }


$('.output').on('click', function() {
  var text;

  var output = 'output';
  $('#output').empty().append(output);
});



});
