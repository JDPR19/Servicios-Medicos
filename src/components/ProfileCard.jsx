import BaseCard from './BaseCard';

function ProfileCard({ name, specialty, phone, image }) {
    return (
        <BaseCard>
            <div className="card-profile">
                <img src={image} alt={name} className="card-avatar" />
                <h3>{name}</h3>
                <p>{specialty}</p>
                <small>{phone}</small>
            </div>
        </BaseCard>
    );
}

export default ProfileCard;
