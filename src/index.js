import 'dotenv/config.js';
import http from 'http';
import logger from './lib/logger.js';
import path from 'path';
import fs from 'fs';

let uploads = Object.create(null);

const onUpload = (req, res) => {
  let fileId = req.headers['x-file-id'];
  let startByte = parseInt(req.headers['x-start-byte']);

  if (!fileId) {
    res.writeHead(400, headers);
    res.end('No file id');
  }

  let filePath = path.join(__dirname, '../tmp', fileId);

  logger.info(`onUpload fileId: ${fileId}`);

  if (!uploads[fileId]) uploads[fileId] = {};
  let upload = uploads[fileId];

  logger.info(`BytesReceived: ${upload.bytesReceived} StartByte: ${startByte}`)

  let fileStream;

  if (!startByte) {
    upload.bytesReceived = 0;

    fileStream = fs.createWriteStream(
      filePath,
      {
        flags: 'w'
      }
    );

    logger.info(`New file created: ${filePath}`);
  } else {
    if (upload.bytesReceived != startByte) {
      res.writeHead(400);
      res.end(`Wrong start byte ${upload.bytesReceived}`);
      return;
    }

    fileStream = fs.createWriteStream(filePath, {
      flags: 'a'
    });
    logger.info(`File reopened: ${filePath}`);
  }


  req.on('data', function (data) {
    logger.info(`bytes received ${upload.bytesReceived}`);
    upload.bytesReceived += data.length;
  });

  req.pipe(fileStream);

  fileStream.on('close', function () {
    if (upload.bytesReceived == req.headers['x-file-size']) {
      logger.info('Upload finished');
      delete uploads[fileId];

      res.end(`Success ${upload.bytesReceived}`);
    } else {
      logger.info(`File unfinished, stopped at ${upload.bytesReceived}`);
      res.end();
    }
  });

  fileStream.on('error', function (err) {
    logger.error(`fileStream error: ${JSON.stringify(err)}`);
    res.writeHead(500);
    res.end('File error');
  });
}

const onStatus = (req, res) => {
  const fileId = req.headers['x-file-id'];
  let upload = uploads[fileId];
  logger.info(`onStatus fileId: ${fileId}, upload: ${upload}`);

  res.writeHead(200);
  res.end(upload ? String(upload.bytesReceived) : '0');
}

const notFound = (req, res) => {
  res.writeHead(404);
  res.end(`${req.method} is not allowed for the request.`);
}

const handler = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.url === '/status' && req.method === 'GET') {
    return onStatus(req, res);
  }
  if (req.url === '/upload' && req.method === 'POST') {
    return onUpload(req, res);
  }

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  return notFound(req, res);
}

http.createServer(handler).listen(
  process.env.PORT,
  () => logger.info(`HTTP server listening port ${process.env.PORT}`),
);
