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
            percentage: 0,
            state: 'pending'
        };

        this.onFileAdded = this.onFileAdded.bind(this);
        this.uploadFile = this.uploadFile.bind(this);
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
            file,
            percentage: 0,
            state: 'pending'
        });
    }

    async uploadFile() {
        try {
            this.setState({
                percentage: 0,
                state: 'loading'
            });

            const startByte = await this.getUploadedBytes();

            return new Promise((resolve, reject) => {
                const req = new XMLHttpRequest();

                req.upload.addEventListener("progress", event => {
                    if (event.lengthComputable) {

                        this.setState({
                            percentage: (event.loaded / event.total) * 100,
                        });
                    }
                });

                req.upload.addEventListener("load", event => {
                    this.setState({
                        state: 'done',
                        percentage: 100
                    });
                    resolve(req.response);
                });

                req.upload.addEventListener("error", event => {
                    this.setState({
                        state: "error",
                        percentage: 0
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
            this.setState({
                state: "error",
                percentage: 0
            });
        }
    }

    renderProgress() {
        return (
            <div className="ProgressWrapper">
                <Progress progress={this.state.percentage} />
            </div>
        );
    }

    renderActions() {
        if (this.state.state === 'error' || this.state.state === 'done') {
            return (
                <button
                    onClick={() =>
                        this.setState({
                            file: false,
                            percentage: 0,
                            state: 'pending'
                        })
                    }
                >
                    Clear
        </button>
            );
        }

        if (this.state.state === 'loading') {
            return (
                <button
                    onClick={() =>
                        this.setState({
                            state: 'pause'
                        })
                    }
                >
                    Stop
        </button>
            );
        }

        if (this.state.state === 'pause') {
            return (
                <button
                    onClick={() =>
                        this.setState({
                            state: 'loading'
                        })
                    }
                >
                    Continue
        </button>
            );
        }

        if (this.state.state === 'pending') {
            return (
                <button
                    disabled={this.state.state === 'pending' && !this.state.file}
                    onClick={this.uploadFile}
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
                    <div className="File">
                        <div key={this.state.file.name} className="Row">
                            File:
                            <span className="Filename">{this.state.file.name}</span>
                            {this.renderProgress()}
                        </div>
                    </div>
                </div>
                <div className="Actions">{this.renderActions()}</div>
            </div>
        );
    }
}

export default Upload;
