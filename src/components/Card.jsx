import '../styles/card.css';

function BaseCard({ children, onClick, color }) {
    return (
        <section className='card-container'>
            <div className="card" onClick={onClick} style={{ backgroundColor: color}}>
                {children}
            </div>
        </section>
    );
}

export default BaseCard;
