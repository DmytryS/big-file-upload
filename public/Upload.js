import React, { Component } from "react";

import Dropzone from "./Dropzone";
import Progress from "./Progress";

const { API_URL } = process.env;

class Upload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            file: false,
            fileId: false,
            uploading: false,
            uploadProgress: {},
            successfullUploaded: false
        };

        this.onFileAdded = this.onFileAdded.bind(this);
        this.uploadFiles = this.uploadFiles.bind(this);
        this.renderActions = this.renderActions.bind(this);
        this.getUploadedBytes = this.getUploadedBytes.bind(this);
    }

    async getUploadedBytes() {
        let response = await fetch(`${API_URL}/status`, {
            headers: new Headers({
                'X-File-Id': this.state.fileId
            }),
        });

        if (response.status != 200) {
            throw new Error("Can't get uploaded bytes: " + response.statusText);
        }

        let text = await response.text();

        return +text;
    }

    onFileAdded(file) {
        this.setState({
            // fileId: `${file.name}-${file.size}-${+file.lastModifiedDate}`,
            fileId: file.name,
            file
        });
    }

    async uploadFiles(file) {
        try {
            const startByte = await this.getUploadedBytes();

            return new Promise((resolve, reject) => {
                const req = new XMLHttpRequest();

                req.upload.addEventListener("progress", event => {
                    if (event.lengthComputable) {

                        this.setState({
                            uploadProgress: {
                                state: "pending",
                                percentage: (event.loaded / event.total) * 100
                            }
                        });
                    }
                });

                req.upload.addEventListener("load", event => {
                    this.setState({
                        uploadProgress: {
                            state: "done",
                            percentage: 100
                        }
                    });
                    resolve(req.response);
                });

                req.upload.addEventListener("error", event => {
                    this.setState({
                        uploadProgress: {
                            state: "error",
                            percentage: 0
                        }
                    });
                    reject(req.response);
                });

                req.open("POST", `${API_URL}/upload`);
                req.setRequestHeader('X-File-Id', this.state.fileId);
                req.setRequestHeader('X-Start-Byte', startByte);
                req.send(this.state.file.slice(startByte));
            });
        } catch (error) {
            console.log('ERR:', error);
        }
    }

    renderProgress(file) {
        const uploadProgress = this.state.uploadProgress;
        if (this.state.uploading || this.state.successfullUploaded) {
            return (
                <div className="ProgressWrapper">
                    <Progress progress={uploadProgress ? uploadProgress.percentage : 0} />
                </div>
            );
        }
    }

    renderActions() {
        if (this.state.successfullUploaded) {
            return (
                <button
                    onClick={() =>
                        this.setState({ file: false, successfullUploaded: false })
                    }
                >
                    Clear
        </button>
            );
        } else {
            return (
                <button
                    disabled={this.state.uploading}
                    onClick={this.uploadFiles}
                >
                    Upload
        </button>
            );
        }
    }

    render() {
        return (
            <div className="Upload">
                <span className="Title">Upload Files</span>
                <div className="Content">
                    <div>
                        <Dropzone
                            onFileAdded={this.onFileAdded}
                            disabled={this.state.uploading || this.state.successfullUploaded}
                        />
                    </div>
                    <div className="Files">

                        <div key={this.state.file.name} className="Row">
                            <span className="Filename">{this.state.file.name}</span>
                            {this.renderProgress(this.state.uploadProgress)}
                        </div>

                    </div>
                </div>
                <div className="Actions">{this.renderActions()}</div>
            </div>
        );
    }
}

export default Upload;
