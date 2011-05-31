// Place your application-specific JavaScript functions and classes here
// This file is automatically included by javascript_include_tag :defaults

(function($) {

  var delay = (function(){
    var timer = 0;
    return function(callback, ms){
      clearTimeout (timer);
      timer = setTimeout(callback, ms);
    };
  })();

  $(document).ready(function(){

    $('#search').keyup(function() {
      delay(function() {
        $('#search_form').submit();
      }, 150);
    });
    $('#search_form').bind('ajax:success', function(event, xhr, status){
      $('#people_container').html(xhr.responseText);
    });
  });
})( jQuery );