import { 
  Check, Zap, Shield, Star, Building, Users, 
  FileText, CreditCard, Calendar, ArrowUpRight, 
  Clock, Download, ChevronRight, TrendingUp
} from 'lucide-react';
import './Abonnement.css';

const Abonnement = () => {
  const currentStatus = {
    planName: 'Starter',
    status: 'Actif',
    startDate: '12 Janvier 2024',
    nextBilling: 'Gratuit à vie',
    usage: [
      { label: 'Biens Immobiliers', current: 1, limit: 1, color: '#0F322B' },
      { label: 'Locataires Gérés', current: 3, limit: 3, color: '#F49E00' },
      { label: 'Rapports Mensuels', current: 2, limit: 5, color: '#10B981' }
    ],
    recentInvoices: [
      { id: 'INV-2024-001', date: '01 Mai 2024', amount: '0 FCFA', status: 'Payé' },
      { id: 'INV-2024-002', date: '01 Avril 2024', amount: '0 FCFA', status: 'Payé' }
    ]
  };

  const plans = [
    {
      name: 'Starter',
      price: 'Gratuit',
      period: 'à vie',
      description: 'Pour les bailleurs avec un seul bien.',
      features: [
        'Jusqu\'à 1 bien immobilier',
        'Gestion de 3 locataires max',
        'Rapports basiques',
        'Support par email'
      ],
      buttonText: 'Plan actuel',
      current: true,
      icon: <Building size={24} />
    },
    {
      name: 'Propriétaire Pro',
      price: '15,000 FCFA',
      period: 'par mois',
      description: 'Idéal pour gérer plusieurs propriétés efficacement.',
      features: [
        'Jusqu\'à 10 biens immobiliers',
        'Locataires illimités',
        'Vérification d\'identité incluse',
        'Rapports détaillés & Historique',
        'Support prioritaire 24/7'
      ],
      buttonText: 'Passer au Pro',
      popular: true,
      icon: <Zap size={24} />
    },
    {
      name: 'Gestion Immobilière',
      price: '45,000 FCFA',
      period: 'par mois',
      description: 'Pour les agences et gros portefeuilles.',
      features: [
        'Biens immobiliers illimités',
        'Multi-utilisateurs (Équipe)',
        'Analyses de rendement avancées',
        'API & Intégrations',
        'Gestionnaire de compte dédié'
      ],
      buttonText: 'Contacter la vente',
      icon: <Shield size={24} />
    }
  ];

  return (
    <div className="bento-abonnement-container">
      {/* TOP HEADER CARD */}
      <div className="bento-card bento-header-card">
        <div className="header-content-v3">
          <div className="header-text-v3">
            <h1>Gestion de l'Abonnement</h1>
            <p>Vue d'ensemble de vos services et options premium</p>
          </div>
          <div className="header-status-v3" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span className="status-badge-v3">
              <span className="dot-green"></span> Plan {currentStatus.planName} Actif
            </span>
            <button className="btn-renew-sub-v3">
              <Zap size={16} /> Renouveler mon abonnement
            </button>
          </div>
        </div>
      </div>

      <div className="bento-grid-v3">
        {/* LEFT COLUMN: STATUS & USAGE (EXPANDED) */}
        <div className="bento-col-left expanded">
          {/* CURRENT PLAN CARD */}
          <div className="bento-card plan-info-card-v3">
            <div className="card-title-v3">
              <Zap size={20} color="#F49E00" />
              <h3>Plan Actuel</h3>
              <button className="btn-edit-mini"><ArrowUpRight size={14} /></button>
            </div>
            <div className="plan-details-v3">
              <div className="plan-name-v3">{currentStatus.planName}</div>
              <div className="plan-price-v3">0 FCFA <small>/mois</small></div>
            </div>
            <div className="plan-meta-v3">
              <div className="meta-item-v3">
                <Calendar size={16} />
                <span>Depuis le {currentStatus.startDate}</span>
              </div>
              <div className="meta-item-v3">
                <CreditCard size={16} />
                <span>{currentStatus.nextBilling}</span>
              </div>
            </div>
          </div>

          {/* USAGE CARD (LARGE) */}
          <div className="bento-card usage-stats-card-v3">
            <div className="card-title-v3">
              <TrendingUp size={20} color="#0F322B" />
              <h3>Statistiques d'utilisation</h3>
            </div>
            <div className="usage-rows-v3">
              {currentStatus.usage.map((u, i) => (
                <div key={i} className="usage-row-v3">
                  <div className="usage-label-v3">
                    <span>{u.label}</span>
                    <span className="usage-count-v3">{u.current} / {u.limit}</span>
                  </div>
                  <div className="progress-v3-bg">
                    <div 
                      className="progress-v3-fill" 
                      style={{ width: `${(u.current / u.limit) * 100}%`, backgroundColor: u.color }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="usage-footer-v3">
              <p>Besoin de plus d'espace ? Passez à l'offre supérieure.</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: CALENDAR & INVOICES */}
        <div className="bento-col-right">
          {/* BILLING CALENDAR STYLE */}
          <div className="bento-card billing-date-card-v3">
            <div className="card-title-v3">
              <h3>Prochain prélèvement</h3>
            </div>
            <div className="date-display-v3">
              <div className="date-month-v3">MAI</div>
              <div className="date-day-v3">15</div>
              <div className="date-year-v3">2024</div>
            </div>
            <div className="date-status-v3">En attente</div>
          </div>

          {/* INVOICES LIST (MEDIUM) */}
          <div className="bento-card invoices-card-v3">
            <div className="card-title-v3">
              <h3>Dernières factures</h3>
              <Clock size={16} />
            </div>
            <div className="invoices-list-v3">
              {currentStatus.recentInvoices.map((inv, i) => (
                <div key={i} className="invoice-row-v3">
                  <div className="inv-info-v3">
                    <span className="inv-id-v3">{inv.id}</span>
                    <span className="inv-date-v3">{inv.date}</span>
                  </div>
                  <button className="btn-dl-v3"><Download size={14} /></button>
                </div>
              ))}
            </div>
            <button className="btn-more-v3">Tout voir <ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: PRICING GRID (BENTO STYLE) */}
      <div className="bento-pricing-section-v3">
        <h2 className="section-title-v3">Toutes les offres</h2>
        <div className="pricing-grid-bento-v3">
          {plans.map((plan, index) => (
            <div key={index} className={`bento-card pricing-bento-card ${plan.popular ? 'popular-v3' : ''} ${plan.current ? 'current-v3' : ''}`}>
              <div className="plan-header-v3">
                <div className="plan-icon-box-v3">{plan.icon}</div>
                <div>
                  <h3>{plan.name}</h3>
                  <p>{plan.price} {plan.period !== 'à vie' ? '/ mois' : ''}</p>
                </div>
              </div>
              <ul className="plan-features-v3">
                {plan.features.slice(0, 3).map((f, i) => (
                  <li key={i}><Check size={14} /> {f}</li>
                ))}
              </ul>
              <button className={`btn-plan-v3 ${plan.popular ? 'btn-gold-v3' : 'btn-outline-v3'}`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Abonnement;
