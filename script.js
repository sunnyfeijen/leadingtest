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

      //set leading
      var leading = $(this).attr('leading')+ 'pt';

      if( vertical_align == 'top' ){
        //remove leading from top line
        if( leading != '' && typeof leading != 'undefined' && i == 0 ){

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
          //compensateLeading( this );
        }

      }


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
          setFont(element, font, err, length, i);
      } else {
        setFont(element, font, err, length, i);
        console.log(font_family+' metrics loaded');
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

    wrapLines(element);

    if(!err){

      var vertical_align = $(element).closest('.block').attr('vertical-align');
      if( vertical_align == 'bottom' && i == (length -1) ){
        // aligned bottom and last paragraph
        compensateLeading(element, font, vertical_align);
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
    if( fontsize != '' && typeof fontsize != 'undefined' ){

      var compensation = fontsize * descenderNormalized;
      $(element).css("margin-bottom", compensation+'pt');

    }

  }



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


  function wrapLines(element){

    var spanInserted = $(element).html().split(" ").join(" </span><span class='line'>");
    // console.log('spanInserted: '+spanInserted);
    var wrapped = ("<span class='line'>").concat(spanInserted, "</span>");
    // console.log('wrapped: '+wrapped);
    $(element).html(wrapped);
    // console.log($(element));
    var refPos = $(element).first('span').position().top;
    // console.log('refPos: '+refPos);
    var newPos;

    $(element).find('span').each(function(index) {
        newPos = $(this).position();
        // console.log(this);
        // console.log('newPos: ');
        // console.log(newPos);
        if (index == 0){
           return;
        }
        if (newPos == refPos){
            $(this).prepend($(this).prev().text() + " ");
            $(this).prev().remove();

            //console.log(newPos);
            //console.log(refPos);
        }
        refPos = newPos;
    });

  }




});
