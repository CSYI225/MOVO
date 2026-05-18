import React, { useState } from 'react';
import { 
  X, Star, CheckCircle, FileText, 
  Image as ImageIcon, Plus, Trash2, 
  AlertTriangle, ShieldCheck, Info
} from 'lucide-react';
import './ReportModal.css';

const ReportModal = ({ isOpen, onClose, tenantName, tenantEmail, tenantPhone }) => {
  const [rating, setRating] = useState(0);
  const [relation, setRelation] = useState('Confirmée');
  const [regularity, setRegularity] = useState('Toujours à temps');
  const [comment, setComment] = useState('');
  const [attachments, setAttachments] = useState([]);

  if (!isOpen) return null;

  const handleAddAttachment = () => {
    const newId = Date.now();
    setAttachments([...attachments, { id: newId, name: `Fichier_${attachments.length + 1}.jpg`, type: 'image' }]);
  };

  const handleDeleteAttachment = (id) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const getRegularityClass = (val) => {
    if (val === 'Toujours à temps') return 'toujours-a-temps';
    if (val === 'Peu de Retard') return 'peu-de-retard';
    return 'retard';
  };

  const getRelationClass = (val) => {
    if (val === 'Confirmée') return 'confirmée';
    if (val === 'Non confirmée') return 'non-confirmée';
    return 'réfusée';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content report-modal-v2-form">
        <div className="modal-header">
          <h2>Nouvelle évaluation du locataire</h2>
          <button className="btn-close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="report-modal-body-v2">
          <form onSubmit={(e) => { e.preventDefault(); onClose(); }} className="report-form-v2">
            
            {/* Tenant Info Section */}
            <div className="section-label-v2">Locataire évalué</div>
            <div className="tenant-card-v2">
               <div className="avatar-v2">{tenantName?.charAt(0) || '?'}</div>
               <div className="tenant-info-v2">
                  <h3>{tenantName}</h3>
                  <div className="tenant-contact-v2">
                    <p>{tenantEmail || 'locataire@email.com'}</p>
                    <p>{tenantPhone || '+225 01 02 03 04 05'}</p>
                  </div>
               </div>
            </div>

            {/* Rating Section */}
            <div className="section-label-v2">Note globale</div>
            <div className="stars-large-v2 clickable">
               {[1, 2, 3, 4, 5].map(s => (
                 <Star 
                    key={s} 
                    size={32} 
                    fill={rating >= s ? "#73BA7C" : "none"} 
                    color="#73BA7C" 
                    onClick={() => setRating(s)}
                    style={{ cursor: 'pointer' }}
                 />
               ))}
            </div>
            <div className="rating-text-v2">
                {rating > 0 ? `${rating} sur 5 - ${rating >= 4 ? 'Excellent' : rating >= 3 ? 'Assez bien' : 'Moyen'}` : 'Veuillez sélectionner une note'}
            </div>

            {/* Relation Section - Read Only as it is automatic */}
            <div className="section-label-v2">Relation locataire-bailleur (Automatique)</div>
            <div className="chips-row-v2">
               {['Confirmée', 'Non confirmée', 'Réfusée'].map(value => (
                 <div 
                   key={value}
                   className={`chip-v2 ${getRelationClass(value)} ${relation === value ? 'active' : ''}`}
                   style={{ cursor: 'default', opacity: relation === value ? 1 : 0.5 }}
                 >
                    {relation === value && <CheckCircle size={14} />}
                    <span>{value}</span>
                 </div>
               ))}
            </div>

            {/* Comment Section */}
            <div className="section-label-v2">Commentaire détaillé</div>
            <div className="comment-card-v2">
               <textarea 
                 className="edit-textarea-v2" 
                 placeholder="Décrivez votre expérience avec ce locataire..."
                 value={comment} 
                 onChange={(e) => setComment(e.target.value)}
                 required
               />
            </div>

            {/* Regularity Section */}
            <div className="section-label-v2">Régularité dans le paiement</div>
            <div className="chips-row-v2">
               {['Toujours à temps', 'Peu de Retard', 'Retard'].map(value => (
                 <div 
                   key={value}
                   className={`chip-v2 ${getRegularityClass(value)} ${regularity === value ? 'active' : ''}`}
                   onClick={() => setRegularity(value)}
                   style={{ cursor: 'pointer' }}
                 >
                   <span>{value}</span>
                 </div>
               ))}
            </div>

            {/* Attachments Section */}
            <div className="section-label-v2">Pièces Jointes - Preuves</div>
            <div className="proofs-grid-v2">
               {attachments.map(file => (
                 <div key={file.id} className="proof-item-v2">
                    <div className="proof-icon-v2">
                        {file.type === 'pdf' ? <FileText size={24} color="#94a3b8" /> : <ImageIcon size={24} color="#94a3b8" />}
                    </div>
                    <span>{file.name}</span>
                    <button type="button" className="btn-delete-proof" onClick={() => handleDeleteAttachment(file.id)}>
                      <Trash2 size={14} />
                    </button>
                 </div>
               ))}
               <div className="proof-item-v2 add-proof" onClick={handleAddAttachment}>
                  <div className="proof-icon-v2"><Plus size={24} color="#0F322B" /></div>
                  <span>Ajouter un fichier</span>
               </div>
            </div>

            <div className="form-footer-v2">
              <button type="button" className="btn-cancel-v2" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn-submit-v2" disabled={!rating || !comment}>
                Publier le rapport
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
