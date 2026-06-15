/**
 * @file DonorCard.jsx
 * @description Re-usable UI card element rendering individual donor profiles, compatibility details, and distances.
 * @author KrishBansod99
 * @reviewed Reviewed and documented by KrishBansod99 for code maintainability.
 */

import { formatDistance } from '../../utils/helpers';

export default function DonorCard({ donor, type, onContact }) {
  return (
    <div className="donor-card glass">
      <div className="donor-card-header">
        <div>
          <span className="badge badge-green">{donor.bloodGroup}</span>
          {donor.available ? (
            <span className="badge badge-green" style={{ marginLeft: 6 }}>Available</span>
          ) : (
            <span className="badge badge-red" style={{ marginLeft: 6 }}>Unavailable</span>
          )}
        </div>
        {donor.distance !== undefined && (
          <span className="donor-distance">{formatDistance(donor.distance)}</span>
        )}
      </div>

      <div className="donor-card-body">
        <div className="donor-detail">
          <span className="donor-label">Age</span>
          <span>{donor.age} years</span>
        </div>
        <div className="donor-detail">
          <span className="donor-label">Gender</span>
          <span>{donor.gender}</span>
        </div>
        <div className="donor-detail">
          <span className="donor-label">Weight</span>
          <span>{donor.weight}</span>
        </div>
        <div className="donor-detail">
          <span className="donor-label">Smoker</span>
          <span>{donor.smoker ? 'Yes' : 'No'}</span>
        </div>
        <div className="donor-detail">
          <span className="donor-label">Alcoholic</span>
          <span>{donor.alcoholic ? 'Yes' : 'No'}</span>
        </div>
        <div className="donor-detail">
          <span className="donor-label">Illnesses</span>
          <span>{donor.illnesses}</span>
        </div>
        {type === 'organ' && donor.organs?.length > 0 && (
          <div className="donor-detail">
            <span className="donor-label">Organs</span>
            <span>{donor.organs.join(', ')}</span>
          </div>
        )}
        <div className="donor-detail">
          <span className="donor-label">City</span>
          <span>{donor.city}</span>
        </div>
      </div>

      <button
        className="btn btn-primary btn-sm"
        style={{ width: '100%', marginTop: 12 }}
        onClick={() => onContact(donor)}
        disabled={!donor.available}
      >
        Contact Securely
      </button>
    </div>
  );
}
