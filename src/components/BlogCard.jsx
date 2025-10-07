import './Card.css';

function BlogCard({ image, title, description, text, date, onAction }) {
    return (
        <div className="blog-card">
            <div className="blog-card-image">
                <img src={image} alt={title} />
            </div>
            <div className="blog-card-content">
                <span className="blog-card-date">{date}</span>
                <h3>{title}</h3>
                <p className="blog-card-description">{description}</p>
                <p className="blog-card-text">{text}</p>
                {onAction && (
                    <button className="card-btn" onClick={onAction}>
                        Leer más
                    </button>
                )}
            </div>
        </div>
    );
}

export default BlogCard;
