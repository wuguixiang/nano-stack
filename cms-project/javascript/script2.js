<script type="text/javascript">
  function onConversationsAPIReady() {
    console.log(`HubSpot Conversations API: ${window.HubSpotConversations}`);
  }

  /*
   If external API methods are already available, use them.
  */
  if (window.HubSpotConversations) {
    onConversationsAPIReady();
    window.HubSpotConversations.widget.remove();
  } else {
    /*
      Otherwise, callbacks can be added to the hsConversationsOnReady on the window object.
      These callbacks will be called once the external API has been initialized.
    */
    window.hsConversationsOnReady = [onConversationsAPIReady];
  }
asd
 </script>
