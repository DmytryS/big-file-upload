import React, { Component } from "react";
// import "./Dropzone.css";

class Dropzone extends Component {
    constructor(props) {
        super(props);
        this.state = { hightlight: false };
        this.fileInputRef = React.createRef();

        this.openFileDialog = this.openFileDialog.bind(this);
        this.onFileAdded = this.onFileAdded.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDrop = this.onDrop.bind(this);
    }

    openFileDialog() {
        if (this.props.disabled) return;
        this.fileInputRef.current.click();
    }

    onFileAdded(evt) {
        if (this.props.disabled) return;
        const file = evt.target.files[0];
        if (this.props.onFileAdded) {
            this.props.onFileAdded(file);
        }
    }

    onDragOver(event) {
        event.preventDefault();
        if (this.props.disabed) return;
        this.setState({ hightlight: true });
    }

    onDragLeave(event) {
        this.setState({ hightlight: false });
    }

    onDrop(event) {
        event.preventDefault();
        if (this.props.disabed) return;
        const file = event.dataTransfer.file;
        if (this.props.onFileAdded) {
            this.props.onFileAdded(file);
        }
        this.setState({ hightlight: false });
    }

    render() {
        return (
            <div
                className={`Dropzone ${this.state.hightlight ? "Highlight" : ""}`}
                onDragOver={this.onDragOver}
                onDragLeave={this.onDragLeave}
                onDrop={this.onDrop}
                onClick={this.openFileDialog}
                style={{ cursor: this.props.disabled ? "default" : "pointer" }}
            >
                <input
                    ref={this.fileInputRef}
                    className="FileInput"
                    type="file"
                    onChange={this.onFileAdded}
                />
                <span>Upload Files</span>
            </div>
        );
    }
}

export default Dropzone;
