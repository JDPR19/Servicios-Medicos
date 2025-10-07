import BaseCard from './BaseCard';

function ServiceCard({ icon, title, description }) {
    return (
        <BaseCard>
            <div className="card-service">
                <span className="card-icon">{icon}</span>
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </BaseCard>
    );
}

export default ServiceCard;
