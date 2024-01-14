const AWS = require('aws-sdk');
const path = require('path');
const fs = require('fs')
require('dotenv').config();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.REGION
});

const s3 = new AWS.S3();
const bucketName = process.env.BUCKET;
const directoryCreationInBucket = async (directoryName) => {
    try {

        const params = {
            Bucket: bucketName,
            Key: directoryName
        }

        const result = await s3.putObject(params).promise();
        return true
    } catch (err) {
        return false;
    }
}

const updateDirectoryInBucket = async (oldDirectoryName, newDirectoryName) => {
    try {
        const oldDirectoryObjects = await s3.listObjectsV2({
            Bucket: bucketName,
            Prefix: oldDirectoryName,
        }).promise();

        for (const object of oldDirectoryObjects.Contents) {
            await s3.copyObject({
                Bucket: bucketName,
                CopySource: `${bucketName}/${object.Key}`,
                Key: `${newDirectoryName}/${path.basename(object.Key)}`,
            }).promise();

            await s3.deleteObject({
                Bucket: bucketName,
                Key: object.Key,
            }).promise();
        }

        return true;
    } catch (err) {
        return false;
    }
}

const deleteDirectoryInBucket = async (directory) => {
    try {
        const directoryObjects = await s3.listObjectsV2({
            Bucket: bucketName,
            Prefix: directory,
        }).promise();

        for (const object of directoryObjects.Contents) {
            await s3.deleteObject({
                Bucket: bucketName,
                Key: object.Key,
            }).promise();
        }

        return true
    } catch (err) {
        return false;
    }
}

const filesCountInDirectory = async (directory) => {
    try {
        const directoryObjects = await s3.listObjectsV2({
            Bucket: bucketName,
            Prefix: directory,
        }).promise();

        return directoryObjects.Contents.length;
    } catch (err) {
        return 0;
    }
}

const uploadFileToS3 = async (directory, fileObject) => {
    try {

        const fileBuffer = fs.readFileSync(fileObject.path)
        const params = {
            Bucket: bucketName,
            Key: `${directory}/${fileObject.originalname}`,
            Body: fileBuffer
        }

        const result = await s3.putObject(params).promise();
        const url = `https://${bucketName}.s3.${process.env.REGION}.amazonaws.com/${directory}/${fileObject.originalname}`;
        return result;
    } catch (err) {
        console.log('ERR ::: ', err);
        return false;
    }
}

const deleteFileFromS3 = async (directory, file) => {
    try {
        const params = {
            Bucket: bucketName,
            Key: `${directory}/${file}`
        }

        await s3.deleteObject(params).promise();
        return true;
    } catch (err) {
        return false;
    }
}

const updateFileFromS3 = async (oldFile, newFile) => {
    try {
        await s3.copyObject({
            Bucket: bucketName,
            CopySource: `/${bucketName}/${oldFile}`,
            Key: newFile,
        }).promise();

        await s3.deleteObject({
            Bucket: bucketName,
            Key: oldFile,
        }).promise();

        const url = `https://${bucketName}.s3.${process.env.REGION}.amazonaws.com/${newFile}`;
        return url;
    } catch (err) {
        console.log('ERR ::: ', err);
        return false;
    }
}

const updateFileToS3 = async (directory, fileObject) => {
    try {

        const updatedImage = fs.readFileSync(fileObject.path);
        const params = {
            Bucket: bucketName,
            Key: directory,
            Body: updatedImage,
        }

        await s3.putObject(params).promise();
        const url = `https://${bucketName}.s3.${process.env.REGION}.amazonaws.com/${directory}/${fileObject.originalname}`;
        return url;
    } catch (err) {
        console.log('ERR ::: ', err);
        return false;
    }

}

const copyObjectinS3 = async (oldFile, newFile) => {
    try {
        await s3.copyObject({
            Bucket: bucketName,
            CopySource: `/${bucketName}/${oldFile}`,
            Key: newFile,
        }).promise();

        const url = `https://${bucketName}.s3.${process.env.REGION}.amazonaws.com/${newFile}`;
        return url;
    } catch (err) {
        console.log('ERR ::: ', err);
        return false;
    }
}

module.exports = {
    directoryCreationInBucket,
    updateDirectoryInBucket,
    deleteDirectoryInBucket,
    filesCountInDirectory,
    uploadFileToS3,
    deleteFileFromS3,
    updateFileFromS3,
    updateFileToS3,
    copyObjectinS3
};