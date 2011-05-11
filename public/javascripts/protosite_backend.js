var UploadInput = Class.create({
  element: null,

  initialize: function(element) {
    this.element = $(element);

    if (!this.element) throw "Uploader requires a file input.";
    if (!this.isCapable()) throw "Uploading using javascript is unsupported in this browser.";

    // get some information from the element
    this.mimeTypes = this.element.getAttribute('data-mime-types').split(' ');
    this.maxSize = parseInt(this.element.getAttribute('data-max-size')) || 1024000;
    this.responseContainer = $(this.element.getAttribute('data-response-container'));

    // we need the token for rails
    try { this.token = $$('meta[name=csrf-token]')[0].readAttribute('content') } catch(e) {}

    this.build();
    this.setupObservers();
  },

  isCapable: function() {
    var xhr = new XMLHttpRequest;
    var fileReader = window.FileReader;

    if (window.Uint8Array && window.ArrayBuffer && !XMLHttpRequest.prototype.sendAsBinary) {
      XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
        var ui8a = new Uint8Array(datastr.length);
        var length = datastr.length;
        for (var i = 0; i < length; ++i) {
          ui8a[i] = (datastr.charCodeAt(i) & 0xff);
        }
        this.send(ui8a.buffer);
      };
    }

    return (xhr.upload && xhr.sendAsBinary && fileReader);
  },

  build: function() {
    this.element.writeAttribute('multiple', true);

    this.form = this.element.up('form');
    if (this.form) {
      // get the method and action
      this.method = this.form.getAttribute('method') || 'post';
      this.action = this.form.getAttribute('action') || window.location.href;

      // hide the submits if we can find any
      this.form.select('input[type=submit]').each(function(element) {
        element.hide();
      });
    }

    // build the file display element
    this.fileDisplay = new Element('div', {'class': 'file-display'}).update('No files to display');

    // build the overall progress indicator
    this.progressIndicatorContainer = new Element('div', {className: 'progress-indicator', style: 'display:none'});
    this.progressIndicatorContainer.update('<div><span>Uploading <b>0%</b></span></div>');
    this.progressIndicator = this.progressIndicatorContainer.down('div');
    this.statusMessage = this.progressIndicatorContainer.down('b');

    // insert the elements after the input
    this.element.insert({after: this.progressIndicatorContainer});
    this.element.insert({after: this.fileDisplay});
  },

  setupObservers: function() {
    // stop form submission
    if (this.form) this.form.observe('submit', function(e) { e.stop(); });

    this.element.observe('change', function() {
      this.loadFilesFromInput();
      this.refreshFileDisplay();
      if (this.responseContainer) this.responseContainer.innerHTML = '';

      // stop if we don't have any files or enough info
      if (this.files.length == 0) return;
      if (!this.method || !this.action) return;

      // show the progress indicator
      this.progressIndicatorContainer.show();

      // begin uploading
      this.nextFile();
    }.bind(this));
  },

  dispose: function() {
    this.progressIndicatorContainer.remove();
    this.fileDisplay.remove();
    this.element.removeAttribute('multiple');
  },

  loadFilesFromInput: function() {
    this.files = [];
    this.fileIndex = 0;
    this.loaded = 0;
    this.total = 0;

    var files = this.getFilesFromInput();
    for (var i = 0; i < files.length; i += 1) {
      var file = new UploadInput.File(files[i], this.maxSize, this.mimeTypes);

      // add it to the list, and add the size to the total
      this.files.push(file);
      if (!file.errors) this.total += file.size;
    }
  },

  getFilesFromInput: function() {
    return this.element.files;
  },

  nextFile: function() {
    // get the next file from the array
    this.file = this.files[this.fileIndex];
    this.fileIndex = this.fileIndex += 1;

    if (!this.file) {
      // no more files, clean up
      this.complete();
    } else if (this.file.errors) {
      // say that it was skipped
      this.updateStatus(this.file.errors + ' (skipped)');
      this.nextFile();
    } else {
      // upload the file
      this.uploadFile();
    }
  },

  uploadFile: function() {
    var xhr = new XMLHttpRequest;
    ['onloadstart', 'onprogress', 'onload', 'onabort', 'onerror'].each(function(event) {
      xhr.upload[event] = this.uploaderEvents[event].bindAsEventListener(this);
    }.bind(this));
    xhr.onload = function(e) {
      if (this.responseContainer) {
        this.responseContainer.insert(e.target.responseText);
      }
    }.bind(this);

    xhr.open(this.method, this.action, true);
    xhr.setRequestHeader('Accept', 'text/javascript, text/html, application/xml, text/xml, */*');
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('X-CSRF-Token', this.token);

    var reader = new FileReader();
    reader.readAsBinaryString(this.file.file);
    reader.onload = function() {
      // build the multipart post string
      var multipart = new UploadInput.MultiPartPost(this.form, this.element, this.file, reader.result);

      // adjust the file size so we can caculate
      this.file.updateSize(multipart.delta);

      // set the content type and send
      xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + multipart.boundary);
      xhr.sendAsBinary(multipart.body);
    }.bind(this);
  },

  refreshFileDisplay: function() {
    var table = new Element('table', {cellpadding: 0});
    this.files.each(function(file) {
      table.insert(file.element);
    });

    this.fileDisplay.update(table);
  },

  updateStatus: function(message, loaded) {
    this.file.updateStatus(message, loaded);

    if (loaded) {
      this.progressIndicator.setStyle({width: Math.floor((this.loaded + loaded) * 100 / this.total) + '%'});
    }
  },

  complete: function() {
    new Effect.Fade(this.progressIndicatorContainer);
    this.element.enable();
  },

  uploaderEvents: {
    onloadstart: function() {
      this.element.disable();
      this.updateStatus('Uploading...');
    },

    onprogress: function(e) {
      this.updateStatus('Uploading...', e.loaded, e.total);
    },

    onload: function() {
      this.updateStatus('100%', this.file.size);
      this.file.updateStatus('100%', this.file.fullSize);
      this.loaded += this.file.size;

      setTimeout(function() { this.nextFile(); }.bind(this), 500);
    },

    onabort: function() {
      this.element.enable();

      this.updateStatus('Aborted');
      this.complete();
    },

    onerror: function() {
      this.updateStatus('Error in processing');
      setTimeout(function() { this.nextFile(); }.bind(this), 500);
    }
  }

});

UploadInput.File = Class.create({
  size: 0,
  fullSize: 0,
  readableSize: '0 bytes',
  name: '',
  errors: false,
  file: null,

  initialize: function(file, maxSize, mimeTypes) {
    this.size = file.size;
    this.readableSize = Utility.bytes(file.fileSize);
    this.name = file.fileName;
    this.type = file.type;
    this.file = file;

    // add any errors if we need to
    var errors = [];
    if (file.fileSize >= maxSize) errors.push('Too large');
    if (!mimeTypes.include(file.type)) errors.push('Unsupported format');
    if (errors.length) this.errors = errors.join(' / ');

    this.build();
  },

  build: function() {
    this.element = new Element('tr', {className: this.errors ? 'error' : ''});
    this.element.insert('\
      <td class="file-name">' + this.name + '</td>\
      <td class="file-size">' + this.readableSize + '</td>\
      <td class="file-status">' + (this.errors || '<div><span>Waiting</span><em>&nbsp;</em></div>') + '</td>');

    this.progressIndicatorContainer = this.element.down('div');
    this.progressIndicator = this.element.down('em');
    this.statusMessage = this.element.down('span') || this.element.down('td.file-status');
  },

  updateSize: function(delta) {
    this.fullSize = this.size + delta;
  },

  updateStatus: function(message, loaded) {
    this.statusMessage.update(message);
    if (loaded) {
      this.statusMessage.update(Math.round(loaded * 100 / this.fullSize) + '%');
      this.progressIndicator.setStyle({width: Math.round(loaded * 100 / this.fullSize) + '%'});
    }
  }
});

UploadInput.MultiPartPost = Class.create({
  delta: 0,
  boundary: 'Boundaryx20072377098235644401115438165x',
  body: '',

  initialize: function(form, input, file, contents) {
    this.formInputs = form ? form.serialize(true) : [];
    this.inputName = input.getAttribute('name').replace(/\[\]$/, '');
    this.file = file;

    this.buildBody(contents);
    this.delta = this.body.length - this.file.size;
  },

  buildBody: function(contents) {
    var boundary = '--' + this.boundary, crlf = '\r\n';
    for (var input in this.formInputs) {
      this.body += boundary + crlf + 'Content-Disposition: form-data; name="' + input + '"' + crlf + crlf + unescape(encodeURIComponent(this.formInputs[input])) + crlf;
    }

    this.body += boundary + crlf + 'Content-Disposition: form-data; name="' + this.inputName + '"; filename="' + this.file.name + '"' + crlf + 'Content-Type: ' + this.file.type + crlf + 'Content-Transfer-Encoding: binary' + crlf + crlf + contents + crlf;
    this.body += boundary + '--';
  }
});

var Cropper = Class.create({
  version: '0.8',
  options: null,

  initialize: function(element, options) {
    this.element = $(element);
    if (!this.element) return;

    this.options = Object.extend({
      maxScaleFactor: 2,
      width: 300,
      height: 300
    }, options);

    this.build();
  },

  build: function() {
    this.element.innerHTML = '<div class="cropper-container"><div class="image-container"></div></div><div class="slider-container"><div class="slider"><div></div></div></div>';
    this.element.addClassName('cropper');

    this.slider = this.element.down('.slider');
    this.sliderHandle = this.element.down('.slider div');
    this.cropper = this.element.down('.image-container');
    this.cropper.setStyle({width: this.options.width + 'px', height: this.options.height + 'px'});

    // gets all the dimensions for the elements we have so far
    this.cropperDimensions = this.cropper.getDimensions();
    this.sliderDimensions = this.slider.getDimensions();
    this.sliderHandleDimensions = this.sliderHandle.getDimensions();
  },

  load: function(image, options) {
    // gets the cropper and sets properties from params passed in
    this.image = Object.extend({image: image}, options);

    // loads the image desired into the cropper for cropping
    this.reset();
    this.element.addClassName('loading');
    this.currentImageDimensions = {width: 0, height: 0};

    // create the cropper image
    this.cropperImage = document.createElement('img'); //new Image();

    // watches for when an image is loaded, and start the cropping for it
    this.cropperImage.observe('load', function() {
      setTimeout(function() {
        this.element.addClassName('loaded');
        this.element.removeClassName('loading');
        this._initCropping();
      }.bind(this), 1);
    }.bind(this));

    this.cropperImage.src = image;
    this.cropperImage.setStyle({visibility: 'hidden'});
    this.cropper.appendChild(this.cropperImage);
  },

  reset: function() {
    this.element.removeClassName('loading');
    this.element.removeClassName('loaded');

    // destroy the image draggable instance
    if (this.imageDraggable) {
      this.imageDraggable.destroy();
      this.imageDraggable = false;
    }

    // dispose the slider handle draggable instance
    if (this.sliderSlider) {
      this.sliderSlider.dispose();
      this.sliderSlider = false;
    }

    if (this.cropperImage) this.cropper.removeChild(this.cropperImage);
    delete(this.cropperImage);
  },

  _initCropping: function() {
    this._setupImage();

    // make the image draggable, and constrain it to the bounding box
    this.imageDraggable = new Draggable(this.cropperImage, {
      snap: function(x, y) {
        var top = parseFloat(this.cropperImage.style.top);
        var left = parseFloat(this.cropperImage.style.left);

        if (this.currentImageDimensions.height > this.cropperDimensions.height) {
          top = y > 0 ? 0 : y + this.currentImageDimensions.height <= this.cropperDimensions.height ? this.cropperDimensions.height - this.currentImageDimensions.height : y;
        }

        if (this.currentImageDimensions.width > this.cropperDimensions.width) {
          left = x > 0 ? 0 : x + this.currentImageDimensions.width <= this.cropperDimensions.width ? this.cropperDimensions.width - this.currentImageDimensions.width : x;
        }

        this._drawImage(top, left);
        return [left, top];
      }.bind(this)
    });

    // allow the silder handle to be dragged
    this.sliderSlider = new Control.Slider(this.sliderHandle, this.slider, {
      axis: 'horizontal',
      sliderValue: this.scaleFactor,
      range: $R(this.scaleFactor, this.options.maxScaleFactor < this.scaleFactor ? this.scaleFactor : this.options.maxScaleFactor),
      onSlide: function(x) {
        this._scaleImage(x);
      }.bind(this)
    });

    // set the interface to loaded
    this.element.addClassName('loaded');
  },

  _setupImage: function() {
    this.imageDimensions = this.cropperImage.getDimensions();

    // get ratios of 2 sides
    var ratioW = this.cropperDimensions.width / this.imageDimensions.width;
    var ratioH = this.cropperDimensions.height / this.imageDimensions.height;
    var shorterRatio = (ratioW > ratioH) ? ratioH : ratioW;
    var longerRatio = (ratioW > ratioH) ? ratioW : ratioH;
    this.scaleFactor = this.image['letterBox'] ? shorterRatio : longerRatio;

    // use longerRatio for scale to fit, shorterRatio for letterbox/pillowbox
    var width = Math.round(this.imageDimensions.width * this.scaleFactor);
    var height = Math.round(this.imageDimensions.height * this.scaleFactor);
    var top = this.cropperDimensions.height / 2 - height / 2;
    var left = this.cropperDimensions.width / 2 - width / 2;

    // move and size the image based on what we decided
    this._drawImage(top, left, width, height);
  },

  _scaleImage: function(scaleFactor) {
    // set the image width based on the scale factor
    var height = Math.round(this.imageDimensions.height * scaleFactor);
    var width = Math.round(this.imageDimensions.width * scaleFactor);

    // center the image based on where it used to be centered
    var centerX = Math.abs(parseFloat(this.cropperImage.style.left)) + (this.cropperDimensions.width / 2);
    var centerY = Math.abs(parseFloat(this.cropperImage.style.top)) + (this.cropperDimensions.height / 2);
    var newCenterX = centerX * (width / this.currentImageDimensions.width);
    var newCenterY = centerY * (height / this.currentImageDimensions.height);
    var left = -(newCenterX - (this.cropperDimensions.width / 2));
    var top = -(newCenterY - (this.cropperDimensions.height / 2));

    // constrain the image to the bounding box
    if (top + height < this.cropperDimensions.height) top = this.cropperDimensions.height - height;
    if (left + width < this.cropperDimensions.width) left = this.cropperDimensions.width - width;
    if (top > 0) top = 0;
    if (left > 0) left = 0;

    // if the image is going into pillowbox center it
    if (width < this.cropperDimensions.width) {
      left = this.cropperDimensions.width / 2 - width / 2;
    }

    // if the image is going into letterbox center it
    if (height < this.cropperDimensions.height) {
      top = this.cropperDimensions.height / 2 - height / 2;
    }

    this._drawImage(top, left, width, height);
  },

  _drawImage: function(top, left, width, height) {
    this.currentImageDimensions.width = width ? width : this.currentImageDimensions.width;
    this.currentImageDimensions.height = height ? height : this.currentImageDimensions.height;

    this.cropperImage.setStyle({top: top + 'px', left: left + 'px', width: width + 'px', height: height + 'px', visibility: 'visible'});
  },

  _cropParameters: function() {
    var normalize = function(coord) {
      coord = (this.image['letterBox']) ? coord * -1 : Math.abs(coord);
      return coord * (this.imageDimensions.height / this.currentImageDimensions.height);
    }.bind(this);
    var scaleFactor = (this.currentImageDimensions.height / this.imageDimensions.height);

    return {
      topLeftX: normalize(parseFloat(this.cropperImage.style.left)) * scaleFactor,
      topLeftY: normalize(parseFloat(this.cropperImage.style.top)) * scaleFactor,
      scaleFactor: scaleFactor,
      letterBox: this.image.letterBox
    };
  },

  crop: function() {
    var params = this._cropParameters();

    if (!this.image.saveUrl) return params;

    new Ajax.Request(this.image.saveUrl, {
      method: 'put',
      asynchronous: true,
      evalScripts: true,
      parameters: params
    });
  }

});

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
    this.makeSiteSelector();
    this.hideFlashMessages();
    this.makeBackgroundImageScale();
    this.makeHelperInputs();
    this.makePasswordStrenghIndicators();
    this.makeTreesSortable();
    this.makeListsSortable();
    this.bindAutocompleters();
    this.displayFullErrorMessages();
    this.makeAssetInputs();
    this.makeUploadInputs();
    this.setupResources();
    this.makeCopySectionsSelector();
    this.makeTemplatePreview();
  },

  /* Provides previews for templates on the section form.
   */
  makeTemplatePreview: function() {
    var element = $('section_template_id');
    if (!element) return;

    element.observe('change', function(e) {
      var templateId = element.getValue();

      // get the section id
      var sectionId = element.up('form').getAttribute('id').replace(/edit_section_|new_section_/, '');
      var url = '/protosite/templates/' + templateId + '/preview';
      if (!templateId) url += '?section_id=' + sectionId;

      $('template_details').addClassName('loading');
      new Ajax.Request(url, {
        method: 'get',
        onSuccess: function(transport) {
          $('template_details').update(transport.responseText);
        },
        onComplete: function() {
          $('template_details').removeClassName('loading');
        }
      });
    });
  },

  /* When creating a new Section, the dropdown list for Parent and Template
   * determine the available Sections in the Source section drop-down.
   * Source section drop-down (right now anyway) should only contain
   * Sections that have the same template as the Section chosen in
   * Source section or Parent. Source section overrides any chosen
   * Parent item.
  */
  makeCopySectionsSelector: function() {
    var elements = $$('#section_parent_id, #section_template_id');
    if (!elements.length) return;

    var updateCopySectionsSelect = function() {
      var type = "";
      var id = "";

      // if the first option is not selected from the template list
      if (elements[1].selectedIndex != 0) {
        type = 'template';
        id = elements[1].getValue();
      } else {
        type = 'section';
        id = elements[0].getValue();
      }

      new Ajax.Request('/protosite/sections/assignable_sources', {
        method: 'get',
        parameters: {
          type: type,
          id:   id
        },
        onSuccess: function(response) {
          $('copy_content').down('ol').update(response.responseText);
        }
      });
    };

    elements.each(function(element) {
      element.observe('change', function(event) {
        updateCopySectionsSelect();
      });
    });
  },

  setupResources: function() {
    var redirectResource = Rails.resource('protosite/redirects');
    redirectResource.add('destroy', function(proceed, pathVars) {
      return {
        onSuccess: function() {
          var element = $('system_generated_path_' + pathVars['']) || $('user_defined_path_' + pathVars['']);
          if (element) element.remove();
        }
      }
    });

    redirectResource.add('create', function() {
      return {
        onSuccess: function(transport) {
          var element = $('user_defined_paths');
          if (element) element.update(transport.responseText);
          Interface.makeHelperInputs(element);
        }
      }
    });
  },

  makeAssetInputs: function() {
    $$('form li.asset').each(function(element) {
      if(element.down("select").readAttribute("multiple") == "multiple") {
        new AssetMultipleInput(element);
      } else {
        new AssetSingleInput(element);
      }
    });
  },

  makeUploadInputs: function() {
    $$('form li.file input[data-mime-types]').each(function(element) {
      window.uploadInput = new UploadInput(element);
    });
  },

  handleCropSubmitClick: function() {
    if (!window.cropper) return false;

    var cropResults = window.cropper.crop();

    $('crop_top_left_x').value = cropResults.topLeftX;
    $('crop_top_left_y').value = cropResults.topLeftY;
    $('crop_scale_factor').value = cropResults.scaleFactor;

    if ($('mobile_cropper_element')) {
      var mobileCropResults = window.mobileCropper.crop();

      $('crop_mobile_crop_attributes_top_left_x').value = mobileCropResults.topLeftX;
      $('crop_mobile_crop_attributes_top_left_y').value = mobileCropResults.topLeftY;
      $('crop_mobile_crop_attributes_scale_factor').value = mobileCropResults.scaleFactor;
    }
  },

  /* Used for cropping, this is the function that's called when you select
   * different crop definitions in the select.
   */
  changeCropDefinition: function(elementOrString, assetUrl) {
    var parserHeightWidth = function(string) {
      var match = string.match(/(\d+) x (\d+)( \(mobile - (\d+) x (\d+)\))?/);
      return [[match[1], match[2]], [match[4], match[5]]];
    };

    if (typeof(elementOrString) != 'string') {
      var stringForParsing = elementOrString.options[elementOrString.selectedIndex].innerHTML
    }

    var dimensionsArray = parserHeightWidth(stringForParsing || elementOrString);
    var defaultDimensions = dimensionsArray[0];
    var mobileDimensions = dimensionsArray[1];

    if (window.mobileCropper) {
      $('mobile_fields').descendants('input').each(function(input) {
        input.value = '';
      });
      try { $('mobile_cropper_element').remove(); } catch(e) {}
    }

    if (defaultDimensions[0] != undefined) {
      window.cropper = new Cropper('cropper_element', {width: parseInt(defaultDimensions[0]), height: parseInt(defaultDimensions[1])});
      window.cropper.load(assetUrl, {letterBox: Interface.settings.allowLetterBoxCrops});

      if (mobileDimensions[0] != undefined) {
        $('cropper_element').insert({after: new Element('div', {id: 'mobile_cropper_element'}) });

        window.mobileCropper = new Cropper('mobile_cropper_element', {width: parseInt(mobileDimensions[0]), height: parseInt(mobileDimensions[1]) });
        window.mobileCropper.load(assetUrl, {letterBox: Interface.settings.allowLetterBoxCrops});
      }
    }
  },

  /* Makes the site selector select switch between different sites.
   */
  makeSiteSelector: function() {
    var element = $('site_selector');
    if (!element) return;

    element.observe('change', function() {
      window.location.href = element.value
    });
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
