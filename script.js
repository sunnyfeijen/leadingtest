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
    $('p').each(function(i) {

      //todo load font
      //console.log( this );
      fontLoad(this, length, i);


      //set leading
      var leading = $(this).attr('leading')+ 'pt';

      if( vertical_align == 'top' ){
        //remove leading from top line
        if( leading != '' && typeof leading != 'undefined' && i == 0 ){
          console.log('first line');
        }

        if( leading != '' && typeof leading != 'undefined' && i != 0 ){
          // $(this).css("margin-top", leading);
          setLeading( this );
        }
      }



      if( vertical_align == 'bottom'){
        //align baseline with bottom

        if( leading != '' && typeof leading != 'undefined' && i != (length -1) ){
          setLeading( this );
        }

        if( leading != '' && typeof leading != 'undefined' && i == (length -1) ){
          setLeading( this );
          console.log('lastline');
          //compensateLeading( this );
        }

      }





      // if( vertical_align == 'top' ){
      //   //remove leading from top line
      //   if( leading != '' && i == 0 ){
      //     leading = '0pt';
      //     $(this).css("margin-top", leading);
      //   }
      //
      //   if( leading != '' && i != 0 ){
      //     $(this).css("margin-top", leading);
      //   }
      // }

      // if( vertical_align == 'bottom'){
      //   //align baseline with bottom
      //
      //   if( (leading != '' || typeof leading === 'undefined') && i != (length -1) ){
      //     $(this).css("margin-top", leading);
      //   }
      //
      //   if( (leading != '' || typeof leading === 'undefined') && i == (length -1) ){
      //     $(this).css("margin-top", leading);
      //
      //     //todo set margin bottom = descender
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
          //todo font load error handling
          console.log('Could not load font: ' + err);
          setFont(element, font, err, length, i);
      } else {
        setFont(element, font, err, length, i);
        console.log('font loaded');
      }
    });

  }

  function setFont(element, font, err, length, i) {

    // set font-family
    var fontFamily = $(element).attr('fontname');
    $(element).css("font-family", fontFamily);


    // set font size
    var fontSize = $(element).attr('font-size')+'pt';
    $(element).css("font-size", fontSize);


    if(!err){

      var vertical_align = $(element).closest('.block').attr('vertical-align');
      if( vertical_align == 'bottom' ){
        if( i == (length -1) ){
          compensateLeading(element, font, vertical_align);
        }
      }

    }

  }


  function setLeading(element, font) {

    var leading = $(element).attr('leading')+ 'pt';
    $(element).css("margin-top", leading);

  }


  function compensateLeading(element, font, vertical_align) {
    //todo compensate leading for alignment

    var emUnits = font.unitsPerEm;
    var ascender = font.tables.os2.sTypoAscender;
    var descender = font.tables.os2.sTypoDescender;
    var ascenderNormalized = ascender / emUnits
    var descenderNormalized = descender / emUnits

    var fontsize = $(element).attr('font-size');
    //$(element).attr('ascender', ascenderNormalized);
    //$(element).attr('descender', descenderNormalized);
    if( fontsize != '' && typeof fontsize != 'undefined' ){

      var compensation = fontsize * descenderNormalized;

      $(element).css("margin-bottom", compensation+'pt');


    }

  }








  // function findLeading(element) {
  //   var leading = 0;
  //
  //   $(element).each(function(){
  //     if( leading <  $(this).attr('leading') ){
  //       leading = $(this).attr('leading');
  //     }
  //   });
  //
  //   return leading;
  // }


  // function findFontSize(element) {
  //   var fontSize = 0;
  //
  //   $(element).each(function(){
  //     fontSize = $(this).attr('font-size');
  //   });
  //
  //   return fontSize;
  // }


});
