$('[data-pdf-list-id]').each(function () {
  var $el = $(this);

  var data = Fliplet.Widget.getData($el.data('pdf-list-id'));

  var $listHolder = $el.find('.list-holder');
  var templates = {
      list: template('pdf-list')
  };

  function template(name) {
      return Handlebars.compile($el.find('.template-' + name).html());
  }

  var currentFiles;

  function getFolderContents() {
    $el.find('.search-wrapper').attr('data-mode', 'loading');
    $el.find('.search-screen').addClass('loading');

    currentFiles = [];
    $listHolder.html('');

    return Fliplet.Media.Folders.get(data).then(function (response) {
      if (!response.files.length || Fliplet.Env.get('development')) {
        response.files.push({
          id: 0,
          name: 'No files available in the selected folder',
          url: 'sample.pdf'
        });
      }
      response.files.forEach(addFile);

      $el.find('.search-wrapper').attr('data-mode', 'default');
      $el.find('.search-screen').removeClass('loading');
      $el.find('.list').attr('data-view', 'default');
      if ( !$el.find('.first-load').hasClass('hidden') ) {
        $el.find('.first-load').addClass('hidden');
      }

      return Promise.resolve();
    });
  }

  // Adds file item template
  function addFile(file) {
    // Only PDF files to be shown on this component
    if (!file.url.match(/\.pdf$/)) {
      return;
    }

    // Converts to readable date format
    file.updatedAt = moment(file.updatedAt).format("Do MMM YYYY");

    currentFiles.push(file);
    $listHolder.append(templates.list(file));
  }

  Fliplet.Navigator.onReady().then(function () {
    if ( $el.find('.offline-notification').hasClass('show') ) {
      $el.find('.offline-notification').removeClass('show');
      $el.find('.offline-screen').removeClass('show');
      $el.find('.list').removeClass('hidden');
    }

    getFolderContents().then(function () {
      // success
    }, function () {
      // fail. perhaps device is offline?
      $el.find('.offline-notification').addClass('show');
      $el.find('.offline-screen').addClass('show');
      $el.find('.list').addClass('hidden');
      $el.find('.first-load').addClass('hidden');
    })
  });

  // EVENTS
  $el.find('.list')
    .on('click', '.list-holder li', function() {
      var mediaId = $(this).attr('data-file-id');
      var pdfUrl = [
        Fliplet.Env.get('apiUrl'),
        'v1/media/files/' + mediaId + '/pdf',
        '?auth_token=' + Fliplet.User.getAuthToken()
      ].join('');
      Fliplet.Navigate.url(pdfUrl);
    });
});