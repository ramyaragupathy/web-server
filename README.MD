An HTTP transaction always involves a client and a server. A web browser is an example of a HTTP client. Browser sends HTTP requests to web servers, and servers send responses back to the browser. Displaying a simple web page can involve dozens of requests — for the HTML page itself, for images or other media, and for additional data that the page needs.

HTTP was originally created to serve hypertext documents, but today is used for much more. As a user of the web, you're using HTTP all the time.

## What's a server ?
A server is just a program that accepts connections from other programs on the network.

When you start a server program, it waits for clients to connect to it — like the demo server waiting for your web browser to ask it for a page. Then when a connection comes in, the server runs a piece of code — like calling a function — to handle each incoming connection. A connection in this sense is like a phone call: it's a channel through which the client and server can talk to each other. Web clients send requests over these connections, and servers send responses back.

Take a look in the terminal where you ran the demo server. You'll see a server log with an entry for each request your browser sent:

## Parts of a URI
A web address is also called a URI for Uniform Resource Identifier. You've seen plenty of these before. From a web user's view, a URI is a piece of text that you put into your web browser that tells it what page to go to. From a web developer's view, it's a little bit more complicated.

You've probably also seen the term URL or Uniform Resource Locator. These are pretty close to the same thing; specifically, a URL is a URI for a resource on the network. Since URI is slightly more precise, we'll use that term in this course. But don't worry too much about the distinction.

A URI is a name for a resource — such as this lesson page, or a Wikipedia article, or a data source like the Google Maps API. URIs are made out of several different parts, each of which has its own syntax. Many of these parts are optional, which is why URIs for different services look so different from one another.

Here is an example of a URI: https://en.wikipedia.org/wiki/Fish

This URI has three visible parts, separated by a little bit of punctuation:

https is the **scheme**;
en.wikipedia.org is the **hostname**;
and /wiki/Fish is the **path**.
Different URIs can have different parts; we'll see more below.

### Scheme
The first part of a URI is the scheme, which tells the client how to go about accessing the resource. Some URI schemes you've seen before include http, https, and file. File URIs tell the client to access a file on the local filesystem. HTTP and HTTPS URIs point to resources served by a web server.

HTTP and HTTPS URIs look almost the same. The difference is that when a client goes to access a resource with an HTTPS URI, it will use an encrypted connection to do it. Encrypted Web connections were originally used to protect passwords and credit-card transactions, but today many sites use them to help protect users' privacy. 

There are many other URI schemes out there, though.

### Hostname
In an HTTP URI, the next thing that appears after the scheme is a hostname — something like www.google.com or localhost. This tells the client which server to connect to.

Often web addresses are written as just a hostname in print. But in the HTML code of a web page, one can't write <a href="www.google.com">this</a> and get a working link to Google. A hostname can only appear after a URI scheme that supports it, such as http or https. In these URIs, there will always be a :// between the scheme and hostname.

Not every URI has a hostname. For instance, a mailto URI just has an email address: mailto:spam@example.net is a well-formed mailto URI. This also reveals a bit more about the punctuation in URIs: the : goes after the scheme, but the // goes before the hostname. Mailto links don't have a hostname part, so they don't have a //.

### Path
In an HTTP URI (and many others), the next thing that appears is the path, which identifies a particular resource on a server. A server can have many resources on it — such as different web pages, videos, or APIs. The path tells the server which resource the client is looking for.

In the real world, URI paths don't necessarily equate to specific filenames. For instance, if you do a Google search, you'll see a URI path such as /search?q=ponies. This doesn't mean that there's literally a file on a server at Google with a filename of search?q=ponies. The server interprets the path to figure out what resource to send. In the case of a search query, it sends back a search result page that maybe never existed before.

When you write a URI without a path, such as http://mysite.com, the browser fills in the default path, which is written with a single slash. That's why http://mysite.com is the same as http://mysite.com/ (with a slash on the end).

The path written with just a single slash is also called the **root**. When you look at the root URI of a local server — http://localhost:8000/ — you're not looking at the root of your computer's whole filesystem. It's just the root of the resources served by the web server. The demo server won't let a web browser access files outside the directory that it's running in.

## Requests

![](https://mdn.mozillademos.org/files/13827/HTTPMsgStructure2.png)

## Response Headers
Headers contain additional data about requests or responses. These are some of the important ones:

Content-Length is a header that must be contained in every response and tells the browser the size of the body in the response. This way the browser knows how many bytes it can expect to receive after the header section and can show you a meaningful progress bar when downloading a file.

Content-Type is also a non-optional header and tells you what type the document has. This way the browser knows which parsing engine to spin up. If it's an image/jpeg, show the image. It’s text/html? Let’s parse it and fire off the necessary, additional HTTP requests. And so on.

Last-Modified is a header that contains the date when the document was last changed. It turned out that the Last-Modified date is not very reliable when trying to figure out if a document has been changed. Sometimes developers will uploaded all files to the server after fixing something, resetting the Last-Modified date on all files even though the contents only changed on a subset. To accommodate this, most servers also send out an ETag. ETag stands for entity tag, and is a unique identifier that changes solely depending on the content of the file. Most servers actually use a hash function like SHA256 to calculate the ETag.

Cache-Control is exactly what it sounds like. It allows the server to control how and for how long the client will cache the response it received. Cache-Control is a complex beast and has a lot of built-in features. 99% of the time, you only need the “cacheability“ and the “max-age”.

If-Modified-Since permits the server to skip sending the actual content of the document if it hasn’t been changed since the date provided in that header. Is there something similar for ETags? Yes there is! The header is called If-None-Match and does exactly that. If the ETag for the document is still matching the ETag sent in the If-None-Match header, the server won’t send the actual document. Both If-None-Match and If-Modified-Since can be present in the same request, but the ETag takes precedence over the If-Modified-Since, as it is considered more accurate.

