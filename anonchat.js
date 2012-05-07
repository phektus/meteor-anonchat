Messages = new Meteor.Collection('messages');

if (Meteor.is_client) {

  ////////// Start Helpers for in-place editing //////////

  // Returns an event_map key for attaching "ok/cancel" events to
  // a text input (given by selector)
  var okcancel_events = function (selector) {
    return 'keyup '+selector+', keydown '+selector+', focusout '+selector;
  };

  // Creates an event handler for interpreting "escape", "return", and "blur"
  // on a text field and calling "ok" or "cancel" callbacks.
  var make_okcancel_handler = function (options) {
    var ok = options.ok || function () {};
    var cancel = options.cancel || function () {};

    return function (evt) {
      if (evt.type === "keydown" && evt.which === 27) {
        // escape = cancel
        cancel.call(this, evt);

      } else if (evt.type === "keyup" && evt.which === 13 ||
                 evt.type === "focusout") {
        // blur/return/enter = ok/submit if non-empty
        var value = String(evt.target.value || "");
        if (value)
          ok.call(this, value, evt);
        else
          cancel.call(this, evt);
      }
    };
  };
  ////////// End Helpers for in-place editing //////////

  Template.entry.events = {};

  Template.entry.events[okcancel_events('#messageBox')] = make_okcancel_handler({
    ok: function (text, event) {
      var message = $('#messageBox').val();
      var ts = Date.now() / 1000;
      Messages.insert({message: message, time: ts});
      // clear up the message box
      $('#messageBox').val('');
    }
  });

  Template.messages.messages = function () {
    var limit = 20;
    var all_messages = Messages.find({}, { sort: {time: -1} }).fetch();
    var to_retain = [];
    messages = all_messages.slice(0,limit);

    // check if all message count over limit
    if(all_messages.length > limit) {
      console.log("Messages in DB over the limit, about to delete some...");
      // loop on messages to return
      for(var x=0; x<=messages.length; x++) {
        // check if we have a message
        if(messages[x]) {
          console.log("Retaining message with id: " + messages[x]._id);
          to_retain.push(messages[x]._id);
        } // end check if we have a message
      } // end loop on messages to return

      // check if we need to delete extra messages
      if(to_retain.length > 0) {
        console.log("removing some messages");
        Messages.remove({_id: {$nin: to_retain} });
      } // end check if we need to delete extra messages
    } // end check if all message count over limit

    console.log("Total messages: " + Messages.find({}).count());
    
    return messages;
  };
}