Interface = {

  settings: {
    allowLetterBoxCrops: false,
    sortableListHandle: null // or provide a class
  },

  initialize: function() {
    // tell css what we can do
    Utility.addHTMLClassName('with-javascript');

    // draw the page
    this.drawPage();
  },

  /* Sets up the page by creating any objects that should be created, and other
   * misc display tasks.
   */
  drawPage: function() {
    this.hideFlashMessages();
    this.makeBackgroundImageScale();
    this.makeHelperInputs();
    this.makePasswordStrenghIndicators();
    this.makeTreesSortable();
    this.makeListsSortable();
    this.bindAutocompleters();
    this.displayFullErrorMessages();
  },

  /* Finds all .tree elements, makes them sortable, and optionally applies
   * expand/contract abilities.
   */
  makeTreesSortable: function(element) {
    element = $(element);

    var trees = [];
    if (element) trees = element.select('.tree');
    else trees = $$('.tree');

    trees.each(function(treeElement) {
      var updateUrl = treeElement.getAttribute('data-url');

      if (updateUrl) {
        Sortable.create(treeElement, {
          tree: true,
          handle: 'handle',
          onUpdate: function() {
            new Ajax.Request(updateUrl, {
              parameters: Sortable.serialize(treeElement, {name: 'node'}),
              onFailure: function(transport) {
                var errors = eval(transport.responseText);
                //console.debug(errors);
              },
              onError: function() {
                alert('Error: Something went wrong. Your changes were unable to be saved.')
              }
            })
          }
        });
      }

      treeElement.select('em.expandable').each(function(control) {
        control.observe('click', function() {
          control.toggleClassName('contracted');
          control.up('li').toggleClassName('contracted');
        });
      });

    });
  },

  /* Toggles even/odd on sortables when they're being sorted.
   */
  reStripeSortedLists: function(element) {
    element = $(element);
    if (!element) return;

    var rows =  element.select('tr');
    for( var i = 0;  i < rows.length; i++) {
      rows[i].removeClassName('odd');
      rows[i].removeClassName('even');
      if(i % 2 == 0) {
        rows[i].addClassName('even');
      } else {
        rows[i].addClassName('odd');
      }
    }
  },

  /* Finds all .sortable-list elements and makes them sortable.
   */
  makeListsSortable: function(element) {
    element = $(element);

    var lists = [];
    if (element) lists = element.select('.sortable-list');
    else lists = $$('.sortable-list');

    lists.each(function(listElement) {
      var updateUrl = listElement.getAttribute('data-url');

      var tag = (listElement.tagName == 'TBODY') ? 'tr' : 'li';
      if (updateUrl) {
        Sortable.create(listElement, {
          handle: Interface.settings.sortableListHandle,
          tag: tag,
          onChange: function() {
            this.reStripeSortedLists(listElement);
          }.bind(this),
          onUpdate: function() {
            new Ajax.Request(updateUrl, {
              parameters: Sortable.serialize(listElement, {name: 'ids'}),
              onError: function() {
                alert('Error: Something went wrong. Your changes were unable to be saved.')
              }
            })
          }.bind(this)
        });
      }
    });
  },

  /* Resizes the background (#background element) and image inside of it to
   * retain it's aspect ratio if there's a classname of 'retain-aspect' on the
   * image -- primarily for client branding.
   */
  makeBackgroundImageScale: function() {
    var element = $('background');
    if (!element) return;

    var image = element.down('img');
    if (!element || !image || !image.hasClassName('retain-aspect')) return;

    var center = true;

    var imageRatio = image.readAttribute('width') / image.readAttribute('height');
    var bodyDimensions = document.viewport.getDimensions();
    var bodyRatio = bodyDimensions.width / bodyDimensions.height;

    var width = 0;
    var height = 0;
    if (imageRatio <= bodyRatio) {
      width = bodyDimensions.width;
      height = bodyDimensions.width / imageRatio;
    } else {
      height = bodyDimensions.height;
      width = bodyDimensions.height * imageRatio;
    }

    element.setStyle({height: bodyDimensions.height + 'px'});
    image.setStyle({
      position: 'absolute',
      top: ((center) ? (-(height - bodyDimensions.height) / 2) : '0') + 'px',
      left: ((center) ? (-(width - bodyDimensions.width) / 2) : '0') + 'px',
      width: width + 'px',
      height: height + 'px'
    });

    if (this.observingBackground) return;
    this.observingBackground = Event.observe(window, 'resize', function() {
      this.makeBackgroundImageScale(element);
    }.bind(this));
  },

  /* Automatically hides flash messages after a given time frame.  This allows
   * for communication with flash messages without forcing the clutter to
   * remain visible.
   */
  hideFlashMessages: function(element) {
    element = $('flash_messages');
    if (!element || element.hasClassName('keep-visible')) return;

    setTimeout(function() {
      new Effect.Morph(element, {
        style: {height: '0px'},
        duration: .5,
        transition: Effect.Transitions.easeFromTo || Effect.Transitions.sinoidal
      });
    }, 4000);
  },

  /* Finds any helper inputs (inputs with a 'helper' class) and will toggle the
   * contents of that input with the contents found in the title attribute of
   * the given element, providing some level of information if an input doesn't
   * provide a label.
   */
  makeHelperInputs: function(element) {
    element = $(element);

    var helpers = [];
    if (element) helpers = element.select('input.helper');
    else helpers = $$('input.helper');

    helpers.each(function(input) {
      if (!input.title || input._helper) return;
      input._helper = true;

      var form = input.up('form');
      if (form) form.observe('submit', function() { if (input.value == input.title) input.value = ''; });

      if (!input.value) input.value = input.title;
      else input.removeClassName('helper');

      input.observe('focus', function() {
        if (input.value == input.title) {
          input.value = '';
          input.removeClassName('helper');
        }
      });

      input.observe('blur', function() {
        if (!input.value) {
          input.value = input.title;
          input.addClassName('helper');
        }
      });
    });
  },

  /* Makes password strengh indicators, which show how secure a given password
   * is based on certain metrics (eg. uppercase, lowercase, numbers, special
   * chars etc.)
   */
  makePasswordStrenghIndicators: function(element) {
    element = $(element);

    var passwords = [];
    if (element) passwords = element.select('input.password-strength');
    else passwords = $$('input.password-strength');

    passwords.each(function(input) {
      var strengthIndicator = new Element('div', {'class': 'password-strength-indicator'}).update('<span></span><div></div>');
      var indicator = strengthIndicator.down('div');
      indicator.setStyle({height: input.getHeight() + 'px'});
      input.insert({after: strengthIndicator});

      var passwordStrength = function(password) {
        var score = 0;
        if (password.match(/[a-z]/)) score += 2; // at least one lower case letter
        if (password.match(/[A-Z]/)) score += 5; // at least one upper case letter
        if (password.match(/\d+/)) score += 5; // at least one number
        if (password.match(/(\d.*\d.*\d)/)) score += 10; // at least three numbers
        if (password.match(/[!,@#$%^&*?_~]/)) score += 5; // at least one special character
        if (password.match(/([!,@#$%^&*?_~].*[!,@#$%^&*?_~])/)) score += 10; // !!at least two special characters
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) score += 2; // !!both upper and lower case
        if (password.match(/\d/) && password.match(/\D/)) score += 2; // !!both letters and numbers
        // uppercase, lowercase, numbers and special characters
        if (password.match(/[a-z]/) && password.match(/[A-Z]/) && password.match(/\d/) && password.match(/[!,@#$%^&*?_~]/)) {
          score += 4;
        }
        score = (100 / 45) * score;

        var complexity = 'Very Weak';
        var color = '#808080';

        if (score >= 20 && score < 40) {
          complexity = 'Weak';
          color = '#FF0000';
        } else if (score >= 40 && score < 60) {
          complexity = 'Good';
          color = '#FFFF00';
        } else if (score >= 60 && score < 80) {
          complexity = 'Strong';
          color = '#0000FF';
        } else if (score >= 80 && score <= 100) {
          complexity = 'Very Strong';
          color = '#008000';
        }
        return {score: Math.ceil(score), complexity: complexity, color: color};
      };

      input.observe('keyup', function() {
        var strength = passwordStrength(input.value);
        var width = (strengthIndicator.getWidth() / 100) * strength.score;
        strengthIndicator.writeAttribute('title', strength.complexity);
        strengthIndicator.down('span').innerHTML = strength.score + '%';
        new Effect.Morph(indicator, {style: {width: width + 'px', backgroundColor: strength.color}, duration: 0.25});
      });
    });
  },

  /* Finds all autocomplete inputs and makes them auto complete using the
   * data-autocomplete-url
   */
  bindAutocompleters: function() {
    $$('.autocomplete').each(function(element) {
      var autocompleteId = element.getAttribute('id');
      var choiceId = autocompleteId + '_choices';

      var choiceDiv = new Element('div', {id: choiceId, className: 'autocomplete-results'});
      element.insert({after: choiceDiv});

      if (element.getAttribute('data-autocomplete-url')) {
        //take the input value then replace the last entered chars with the selection
        // element.value.split(', ').pop push(selectLi).join(', ')
        var appendSelection = function (selectedLi){
          var tags = element.value.split(', ');
          tags.pop();
          tags.push(selectedLi.innerHTML);
          element.value = tags.join(', ');
        };

        new Ajax.Autocompleter(autocompleteId, choiceId, element.getAttribute('data-autocomplete-url'), {
          method: 'get',
          updateElement: appendSelection,
          callback: function(value, query) {
            return 'partial_value=' + element.value.split(', ').pop();
          }
        });
      } else {
        throw "you must define the 'data-autocomplete-url' attribute on your automplete inputs";
      }
    });
  },

  /* Some errors don't appear in the form, and to mitigate this we have a
   * toggle to view the full error messages.
   */
  displayFullErrorMessages: function() {
    $$('.message').each(function(element) {
      var fullMessage = element.down('.full-message');
      if (!fullMessage) return;

      element.down('.view-full-message').observe('click', function(event) {
        event.stop();
        if (fullMessage.visible()) {
          fullMessage.hide();
        } else {
          fullMessage.show();
        }
      });
    })
  }

};

Event.observe(document, 'dom:loaded', function() { Interface.initialize() });
