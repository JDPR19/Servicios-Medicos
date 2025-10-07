import './Card.css';

function AdvancedCard({ image, title, description, text, onAction }) {
    return (
        <div className="advanced-card">
            <div className="card-image">
                <img src={image} alt={title} />
            </div>
            <div className="card-content">
                <h3>{title}</h3>
                <p className="card-description">{description}</p>
                <p className="card-text">{text}</p>
                {onAction && (
                    <button className="card-btn" onClick={onAction}>
                        Ver más
                    </button>
                )}
            </div>
        </div>
    );
}

export default AdvancedCard;
