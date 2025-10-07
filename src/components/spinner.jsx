import './Loader.css';

function Spinner({ size = 50, color = "#0077b6" }) {
    return (
        <div 
            className="spinner" 
            style={{ 
                width: size, 
                height: size, 
                borderTopColor: color 
            }}
        ></div>
    );
}

export default Spinner;
