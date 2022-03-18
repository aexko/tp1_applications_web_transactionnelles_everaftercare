// Userlist data array for filling in info box
var userListData = [];

// DOM Ready =============================================================
$(document).ready(function() {
  // Populate the user table on initial page load
  populateTable();

  // Username link click    
  $('#userList table tbody').on('click', 'td a.linkshowuser', showUserInfo);     
  // Add User button click   
  $('#btnAddUser').on('click', addUser);
 
  //Delete User link click
  $('#userList table tbody').on('click', 'td a.linkdeleteuser', deleteUser);
});

// Functions =============================================================

// Fill table with data
function populateTable() {

  // Empty content string
  var tableContent = '';
  // jQuery AJAX call for JSON
  $.getJSON( '/users/userlist', function( data ) {

    // For each item in our JSON, add a table row and cells to the content string
    $.each(data, function(){
    
      tableContent += '<tr>';
      tableContent += '<td><a href="#" class="linkshowuser" rel="' + this._id + '">' + this.last_name + '</a></td>';
      tableContent += '<td>' + this.email + '</td>';
      tableContent += '<td><a href="#" class="linkdeleteuser" rel="' + this._id + '">delete</a></td>';
      tableContent += '</tr>';
      
  });
        // Inject the whole content string into our existing HTML table        $('#userList table tbody').html(tableContent);    });};
    // Inject the whole content string into our existing HTML table
    $('#userList table tbody').html(tableContent);
  });
};

function showUserInfo(event) {
  // Prevent Link from Firing 
  
  event.preventDefault();

  /**
   * ou
   * Ce qui a été modifié/ajouter par moi
   */
 //$('a.linkshowuser').on('click', function(){
 // var thisUserName = $(this).attr('rel');
 
  // Retrieve username from link rel attribute    
  var thisUserName = $(this).attr('rel');
  
  /**
   * Ce qui a été modifié/ajouter par moi
   */
  $.getJSON( '/users/userlist').done (function( data ) {
       userListData = data.map(function (item) {
      return item;
  });

  // Get Index of object based on id value   

  //  var arrayPosition = userListData.indexOf(thisUserName);
  /**
   * ou Ce qui a été modifié/ajouter par moi
   */
  var arrayPosition = userListData.findIndex(obj => obj._id==thisUserName);

 
  // Get our User Object    
 
  var thisUserObject = userListData[arrayPosition];
  //Populate Info Box    
  $('#userInfoName').text(thisUserObject.first_name + thisUserObject.last_name);    
  $('#userInfoAge').text(thisUserObject.email);    
  $('#userInfoGender').text(thisUserObject.password);   
  $('#userInfoLocation').text(thisUserObject.id);

});
};

function deleteUser(event) {
  event.preventDefault();

  //Pop up a confirmation dialog
  var confirmation = confirm('Are you sure you want to delete this user?');

  //Check and make sure the user confirmed
  if (confirmation === true) {

      //If they did, do our delete
      $.ajax({
          type: 'DELETE',
          url: '/users/deleteuser/' + $(this).attr('rel')
      }).done(function (response) {
          //Check for a successful response
          if (response.msg === '') {

          } else {
              alert('Error: ' + response.msg);
          }

          //Update the table
          populateTable();
      });
  } else {
      //If they said no to the confirm, do notiong
      return false;
  }
};

//Add User
function addUser(event) {
  event.preventDefault();

  //Super basic validation - increase errorCount variable if any fields are blank
  var errorCount = 0;
  $('#addUser input').each(function (index, val) {
      if ($(this).val() === '') {
          errorCount++;
      }
  });

  //Check and make sure errorCount's still at zero
  if (errorCount === 0) {

      //If it is, compile all user info into one object
      var newUser = {
          'username': $('#addUser fieldset input#inputUserName').val(),
          'email': $('#addUser fieldset input#inputUserEmail').val(),
          'fullname': $('#addUser fieldset input#inputUserFullname').val(),
          'age': $('#addUser fieldset input#inputUserAge').val(),
          'location': $('#addUser fieldset input#inputUserLocation').val(),
          'genre': $('#addUser fieldset input#inputUserGender').val()
      }

      //Use AJAX to post the object to our adduser service
      $.ajax({
          type: 'POST',
          data: newUser,
          url: '/users/adduser',
          dataType: 'JSON'
      }).done(function (response) {

          //Check for successful response
          if (response.msg === '') {
              //Clear the form inputs
              $('#addUser fieldset input').val('');

              //Update the table
              populateTable();
          } else {
              //If something goes wrong, alert the error message thatour service returned
              alert('Error: ' + response.msg);
          }
      });
  } else {
      //If errorCount is more than 0, error out
      alert('Please fill in all fields');
      return false;
  }
};