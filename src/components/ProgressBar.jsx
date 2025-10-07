import './Loader.css';

function ProgressBar({ progress = 0, color = "#0077b6" }) {
    return (
        <div className="progress-bar">
            <div 
                className="progress-bar-fill" 
                style={{ width: `${progress}%`, backgroundColor: color }}
            ></div>
        </div>
    );
}

export default ProgressBar;
