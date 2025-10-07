import BaseCard from './Card';

function InfoCard({ title, description }) {
    return (
        <BaseCard>
            <h3>{title}</h3>
            <p>{description}</p>
        </BaseCard>
    );
}

export default InfoCard;
