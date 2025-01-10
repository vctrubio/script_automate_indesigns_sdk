function downloadImage(url, localPath) {
    try {
        var socket = new Socket();
        var urlParts = url.split('/');
        var hostname = urlParts[2];
        var path = '/' + urlParts.slice(3).join('/');

        if (socket.open(hostname + ':443', 'binary')) {
            var request = 'GET ' + path + ' HTTP/1.1\r\nHost: ' + hostname + '\r\nConnection: close\r\n\r\n';
            socket.write(request);

            var response = socket.read();
            if (response) {
                var imageStart = response.indexOf('\r\n\r\n') + 4;
                var imageData = response.substr(imageStart);

                var file = new File(localPath);
                file.encoding = 'BINARY';
                file.open('w');
                file.write(imageData);
                file.close();

                return true;
            }
        }
        socket.close();
    } catch (e) {
        alert('Error downloading image: ' + e);
    }
    return false;
}

$.global.downloadImage = downloadImage