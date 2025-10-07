import './Card.css';

function GridCard({ image, title, description, onAction }) {
    return (
        <div className="grid-card">
            <div className="grid-card-image">
                <img src={image} alt={title} />
            </div>
            <div className="grid-card-content">
                <h3>{title}</h3>
                <p>{description}</p>
                {onAction && (
                    <button className="card-btn" onClick={onAction}>
                        Ver más
                    </button>
                )}
            </div>
        </div>
    );
}

export default GridCard;
