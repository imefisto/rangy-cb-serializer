(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof exports === "object") {
    module.exports = factory();
  } else {
    root.RangyCBSerializer = factory(); // <= Change this name
  }
}(this, function() {

  /* Rangy True Cross Browser Serialize/deserialize Javascript Functions
  Copyright 2013 Jeff Baker
  http://www.seabreezecomputers.com
  Ver 1.0 - 9/26/2013

  To be user with Rangy by Tim Down  
  https://code.google.com/p/rangy/

  I have created serialize/deserialize functions for Rangy that gives the same serialization between 
  IE <= 8, IE 9, Webkit (Chrome, Safari) and Firefox.  It seems to work in the testing I have done.  
  The two functions have comments explaining what they do.  You can serialize a range in IE and it 
  should be able to deserialize in Chrome, etc. It has worked so far in multiple pages that I have tested.

  It basically counts through all elements on the page or in the rootNode provided and skips the elements 
  that are not compatible between the browsers or that have an emtpy innerHTML.  The incompatible elements 
  are title tags and comment tags and some tags with empty innerHTML.

  The serialized range that is returned is seperated by commas and contains this data: startCharacter, endCharacter,
   startElement, endElement, startTextNode, endTextNode. So 0,26,333,333,0,0 would be the 0th or 1st 
   character hightlighted to the 26th character highlighted, in the 333 HTML element (not counting 
   incompatible elements) starting and ending in the first text node in the element (or text node 0).
   */

  function cb_deserializeRange(serialized, rootNode, range)
  {
    /* cross browser deserializeRange function */

    if (!rootNode)
      rootNode = document.body;

    /* serialized is start, end, startNode, endNode */
    var serial_parts = serialized.split(","); // split serialized parts by ,
    var range_to_return;
    var compatible_elements = 0; // Num of compatible elements with all browsers
    var startNode, endNode;
    var the_tags = "";

    if(range) {
      range_to_return = range;
    } else if(rangy) {
      range_to_return = rangy.createRange();
    }

    var all_elements = rootNode.getElementsByTagName("*");

    // Cycle through all elements until startNode element
    for (var i=0; i < all_elements.length; i++) 
    {
      /* IE includes comment elements (nodeType == 8) but excludes any blank HTML tags except BR??
      Webkit & FF excludes comment elements but includes blank or empty HTML tags
      Webkit & FF includes the TITLE tag but IE excludes it
      */
      if (!all_elements[i].innerHTML.match(/^\s*?$/) && all_elements[i].nodeName.toLowerCase() != "title" && all_elements[i].nodeType != 8)
      {
        the_tags += i+":"+all_elements[i].nodeName+". ";
        compatible_elements++;
        if (compatible_elements == parseInt(serial_parts[2])) // This is the start node we are looking for
        {
          startNode = all_elements[i];
          if (endNode)
            break;
        }
        if (compatible_elements == parseInt(serial_parts[3])) // This is the end node we are looking for
        {
          endNode = all_elements[i];
          if (startNode)
            break;	
        }
      }

    }

    if(startNode && endNode)
    {

      startNode = startNode.childNodes[serial_parts[4]]; // set the text node start
      endNode = endNode.childNodes[serial_parts[5]]; // set the text node of end

      range_to_return.setStart(startNode, parseInt(serial_parts[0]));
      range_to_return.setEnd(endNode, parseInt(serial_parts[1]));

      return range_to_return;
    }		

  } // end function cb_deserializeRange(serialized, rootNode)


  function cb_serializeRange(range, rootNode)
  {
    /* cross browser serializeRange function */

    if (!rootNode)
      rootNode = document.body;

    var startPos = range.startOffset;
    var endPos = range.endOffset;
    var startNode = range.startContainer.parentNode; // Element containing start character
    var endNode = range.endContainer.parentNode; // Element containing end character
    var the_tags = "";
    var compatible_elements = 0; // Num of compatible elements with all browsers
    var all_elements = rootNode.getElementsByTagName("*");

    // Cycle through all elements until startNode element
    for (var i=0; i < all_elements.length; i++) 
    {
      /* IE includes comment elements (nodeType == 8) but excludes any blank HTML tags except BR??
      Webkit & FF excludes comment elements but includes blank or empty HTML tags
      Webkit & FF includes the TITLE tag but IE excludes it
      */
      if (!all_elements[i].innerHTML.match(/^\s*?$/) && all_elements[i].nodeName.toLowerCase() != "title" && all_elements[i].nodeType != 8)
      {
        the_tags += i+":"+all_elements[i].nodeName+". ";
        compatible_elements++;
      }

      if (all_elements[i] == startNode) // startNode we are looking for 
      {	
        var startNodePos = compatible_elements;	
        if (typeof endNodePos != "undefined")
          break;
      }
      if (all_elements[i] == endNode) // endNode we are looking for
      {	
        var endNodePos = compatible_elements;	
        if (typeof startNodePos != "undefined")
          break;
      }
    }	

    // We need to get the correct text node in the parentNode of startNode
    for (var i = 0; i < startNode.childNodes.length; i++)
      //if(startNode.childNodes[i].nodeType == 3)
    {
      if (startNode.childNodes[i] == range.startContainer)
      {
        var startTextNode = i;
        break;
      }
    }
    // We need to get the correct text node in the parentNode of endNode
    for (var i = 0; i < endNode.childNodes.length; i++)
      //if(endNode.childNodes[i].nodeType == 3)
    {
      if (endNode.childNodes[i] == range.endContainer)
      {
        var endTextNode = i;
        break;
      }
    }


    if (typeof startNodePos == "undefined")
      startNodePos = endNodePos;
    var serialized = parseInt(startPos)+","+parseInt(endPos)+","+parseInt(startNodePos)+","+parseInt(endNodePos)+
      ","+parseInt(startTextNode)+","+parseInt(endTextNode);
    return serialized;	

  } // end function cb_serializeRange(range, rootNode)

  return {
    serialize: cb_serializeRange,
    deserialize: cb_deserializeRange
  };

}));
