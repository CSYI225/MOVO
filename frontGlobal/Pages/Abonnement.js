import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Modal, TextInput, Image, StatusBar, Dimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { COLORS, SIZES, globalStyles, fs } from '../Styles/global';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const PLANS = [
  {
    id: 'starter',
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
    icon: 'home',
    iconColor: '#182C2A',
    iconBg: '#E1EBE6',
  },
  {
    id: 'pro',
    name: 'Propriétaire Pro',
    price: '15 000 FCFA',
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
    icon: 'zap',
    iconColor: '#F59A23',
    iconBg: '#FFF8E1',
  },
  {
    id: 'agency',
    name: 'Gestion Immobilière',
    price: '45 000 FCFA',
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
    icon: 'shield',
    iconColor: '#4CAF50',
    iconBg: '#E8F5E9',
  }
];

// ── Plans Visiteur ───────────────────────────────────────
const VISITOR_PLANS = [
  {
    id: 'ponctuel',
    name: 'Accès Ponctuel',
    price: '500 FCFA',
    period: 'par achat',
    credits: 3,
    description: 'Consultez 3 profils complets. Renouvelable à volonté.',
    features: [
      'Accès à 3 profils locataires complets',
      'Historique de location visible',
      'Avis propriétaires débloqués',
      'Valable sans limite de temps',
    ],
    icon: 'flash',
    iconColor: '#F59A23',
    iconBg: '#FFF8E1',
    buttonText: 'Acheter',
    action: 'ponctuel',
  },
  {
    id: 'week',
    name: 'Premium Semaine',
    price: '3 500 FCFA',
    period: 'par semaine',
    description: 'Accès illimité à tous les profils pendant 7 jours.',
    features: [
      'Profils illimités pendant 7 jours',
      'Résultats de recherche complets',
      'Historique & avis sans restriction',
      'Badge « Visiteur Premium »',
    ],
    popular: false,
    icon: 'calendar',
    iconColor: '#4CAF50',
    iconBg: '#E8F5E9',
    buttonText: 'S\'abonner',
    action: 'week',
  },
  {
    id: 'month',
    name: 'Premium Mois',
    price: '10 000 FCFA',
    period: 'par mois',
    description: 'Accès illimité à tous les profils pendant 30 jours.',
    features: [
      'Profils illimités pendant 30 jours',
      'Résultats de recherche complets',
      'Historique & avis sans restriction',
      'Badge « Visiteur Premium »',
    ],
    popular: true,
    icon: 'calendar',
    iconColor: '#4CAF50',
    iconBg: '#E8F5E9',
    buttonText: 'S\'abonner',
    action: 'month',
  },
  {
    id: 'year',
    name: 'Premium Année',
    price: '80 000 FCFA',
    period: 'par an',
    description: 'Le meilleur rapport qualité/prix — 365 jours d\'accès.',
    features: [
      'Profils illimités pendant 365 jours',
      'Résultats de recherche complets',
      'Historique & avis sans restriction',
      'Badge « Visiteur Premium »',
      'Économisez 40 000 FCFA vs mensuel',
    ],
    icon: 'star',
    iconColor: '#4CAF50',
    iconBg: '#E8F5E9',
    buttonText: 'S\'abonner',
    action: 'year',
  },
];

export default function Abonnement({ navigation }) {
  const { user, purchaseAccess, subscribe, hasActiveSubscription } = useAuth();
  const isVisitor = user?.role === 'visitor';
  const [pendingAction, setPendingAction] = useState(null);

  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalState, setModalState] = useState('payment'); // 'payment' | 'success'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('orange');

  // Données dynamiques de l'abonnement
  let currentStatus = {};
  if (isVisitor) {
    const activeSub = hasActiveSubscription();
    let planName = 'Gratuit';
    let status = 'Gratuit';
    let nextBilling = '-';
    let price = '0 FCFA';
    let period = '';
    let usage = [];
    
    if (activeSub) {
      planName = `Premium ${user.subscription.plan}`;
      status = 'Actif';
      nextBilling = new Date(user.subscription.expiresAt).toLocaleDateString('fr-FR');
      price = VISITOR_PLANS.find(p => p.action === user.subscription.plan)?.price || '0 FCFA';
      period = VISITOR_PLANS.find(p => p.action === user.subscription.plan)?.period || '';
      usage = [{ label: 'Profils Illimités', current: '∞', limit: '∞', color: '#4CAF50' }];
    } else if (user?.accessCredits > 0) {
      planName = 'Accès Ponctuel';
      status = 'Crédité';
      nextBilling = 'Sans limite de temps';
      price = '500 FCFA';
      period = 'par achat';
      usage = [{ label: 'Crédits profils restants', current: user.accessCredits, limit: user.totalPurchasedCredits || 3, color: '#F59A23' }];
    } else {
      usage = [{ label: 'Profils Locataires', current: 0, limit: 0, color: '#182C2A' }];
    }

    currentStatus = {
      planName,
      status,
      price,
      period,
      startDate: activeSub ? new Date(user.subscription.startDate).toLocaleDateString('fr-FR') : '-',
      nextBilling,
      usage,
      recentInvoices: user?.invoices || []
    };
  } else {
    // Mode Bailleur
    currentStatus = {
      planName: 'Starter',
      status: 'Actif',
      price: '0 FCFA',
      period: 'à vie',
      startDate: '12 Janvier 2024',
      nextBilling: 'Gratuit à vie',
      usage: [
        { label: 'Biens Immobiliers', current: 1, limit: 1, color: '#182C2A' },
        { label: 'Locataires Gérés', current: 3, limit: 3, color: '#F59A23' },
        { label: 'Rapports Mensuels', current: 2, limit: 5, color: '#4CAF50' }
      ],
      recentInvoices: user?.invoices || []
    };
  }

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    if (planId !== 'starter') {
      setModalState('payment');
      setModalVisible(true);
    }
  };

  const handleConfirmPayment = () => {
    // Appliquer la logique d'achat selon le plan sélectionné
    const activePlans = isVisitor ? VISITOR_PLANS : PLANS;
    const plan = activePlans.find(p => p.id === selectedPlan);
    
    if (plan) {
      if (plan.action === 'ponctuel') {
        purchaseAccess(plan.price, plan.name);
      } else if (['week', 'month', 'year'].includes(plan.action)) {
        subscribe(plan.action, plan.price, plan.name);
      }
    }

    setTimeout(() => {
      setModalState('success');
    }, 1000);
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  const getSelectedPlanDetails = () => {
    const activePlans = isVisitor ? VISITOR_PLANS : PLANS;
    return activePlans.find(p => p.id === selectedPlan) || activePlans[1] || activePlans[0];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header Block */}
      <View style={styles.headerBlock}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#182C2A" />
          </TouchableOpacity>
          <View style={styles.logoContainerSmall}>
            <Image 
              source={require('../assets/images/logo.png')} 
              style={{ width: 60, height: 25, resizeMode: 'contain' }} 
            />
          </View>
          <Text style={styles.headerTitle}>Abonnement</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TOP BENTO CARD: STATUS HEADER */}
        <View style={styles.bentoHeaderCard}>
          <View style={styles.bentoHeaderLeft}>
            <Text style={styles.bentoHeaderTitle}>Gestion de l'Abonnement</Text>
            <Text style={styles.bentoHeaderSub}>Vue d'ensemble de vos services</Text>
          </View>
          <View style={styles.bentoHeaderRight}>
            <View style={[styles.statusBadge, 
              currentStatus.status === 'Gratuit' ? {backgroundColor: '#F2F4F4'} : 
              currentStatus.status === 'Crédité' ? {backgroundColor: '#FFF8E1'} : {}
            ]}>
              <View style={[styles.dotGreen, 
                currentStatus.status === 'Gratuit' ? {backgroundColor: '#7A8B89'} : 
                currentStatus.status === 'Crédité' ? {backgroundColor: '#F59A23'} : {}
              ]} />
              <Text style={[styles.statusBadgeText, 
                currentStatus.status === 'Gratuit' ? {color: '#7A8B89'} : 
                currentStatus.status === 'Crédité' ? {color: '#F59A23'} : {}
              ]}>
                {isVisitor ? currentStatus.status : `Plan ${currentStatus.planName} Actif`}
              </Text>
            </View>
          </View>
        </View>

        {/* BENTO BLOCK 1: PLAN ACTUEL */}
        <View style={styles.bentoCard}>
          <View style={styles.cardHeaderTitleRow}>
            <Feather name="zap" size={18} color="#F59A23" style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Plan Actuel</Text>
          </View>
          
          <View style={styles.planDisplayRow}>
            <Text style={styles.planDisplayName}>{currentStatus.planName}</Text>
          </View>

          <View style={styles.metaDivider} />

          <View style={styles.metaItemRow}>
            <Feather name="calendar" size={14} color="#7A8B89" style={{ marginRight: 8 }} />
            <Text style={styles.metaItemText}>Depuis le {currentStatus.startDate}</Text>
          </View>
          <View style={[styles.metaItemRow, { marginTop: 8 }]}>
            <Feather name="credit-card" size={14} color="#7A8B89" style={{ marginRight: 8 }} />
            <Text style={styles.metaItemText}>{currentStatus.nextBilling}</Text>
          </View>
        </View>

        {/* BENTO BLOCK 2: STATISTIQUES D'UTILISATION */}
        <View style={styles.bentoCard}>
          <View style={styles.cardHeaderTitleRow}>
            <Feather name="trending-up" size={18} color="#182C2A" style={{ marginRight: 8 }} />
            <Text style={styles.cardTitle}>Statistiques d'utilisation</Text>
          </View>

          <View style={styles.usageRowsContainer}>
            {currentStatus.usage.map((u, i) => (
              <View key={i} style={styles.usageRow}>
                <View style={styles.usageLabelRow}>
                  <Text style={styles.usageLabelText}>{u.label}</Text>
                  <Text style={styles.usageCountText}>{u.current} / {u.limit}</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${(u.current / u.limit) * 100}%`, backgroundColor: u.color }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={styles.usageFooterBox}>
            <Text style={styles.usageFooterText}>Besoin de plus d'espace ? Passez à l'offre supérieure ci-dessous.</Text>
          </View>
        </View>

          {/* INVOICES CARD */}
          <View style={styles.bentoCard}>
            <View style={styles.cardHeaderTitleRow}>
              <Feather name="file-text" size={18} color="#182C2A" style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Factures & Reçus</Text>
            </View>
            
            <View style={styles.miniInvoicesList}>
              {currentStatus.recentInvoices.length > 0 ? currentStatus.recentInvoices.map((inv, i) => (
                <View key={i} style={[styles.invoiceItemMini, { marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F2F4F4' }]}>
                  <View style={styles.invoiceItemLeft}>
                    <Text style={styles.invoiceIdText}>{inv.id}</Text>
                    <Text style={styles.invoiceDateText}>{inv.date} - {inv.planName}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: fs(13), fontWeight: '700', color: '#4CAF50', marginRight: 12 }}>{inv.amount}</Text>
                    <TouchableOpacity style={styles.invoiceDlBtn}>
                      <Feather name="download" size={14} color="#182C2A" />
                    </TouchableOpacity>
                  </View>
                </View>
              )) : (
                <Text style={{ color: '#7A8B89', fontSize: fs(13), textAlign: 'center', marginTop: 10 }}>Aucune facture disponible pour le moment.</Text>
              )}
            </View>
          </View>

        <View style={styles.pricingSectionHeader}>
          <Text style={styles.pricingSectionTitle}>Toutes les offres</Text>
        </View>

        {(isVisitor ? VISITOR_PLANS : PLANS).map((plan) => {
          const isCurrent = plan.current;
          return (
            <View 
              key={plan.id} 
              style={[
                styles.pricingCard, 
                plan.popular && styles.pricingCardPopular,
                isCurrent && styles.pricingCardCurrent
              ]}
            >
              {plan.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>POPULAIRE</Text>
                </View>
              )}

              <View style={styles.pricingHeaderRow}>
                <View style={[styles.planIconBox, { backgroundColor: plan.iconBg }]}>
                  <Feather name={plan.icon} size={20} color={plan.iconColor} />
                </View>
                <View style={styles.planTitleContainer}>
                  <Text style={styles.planNameText}>{plan.name}</Text>
                  <Text style={styles.planPriceText}>
                    <Text style={styles.planPriceBold}>{plan.price}</Text> {plan.period !== 'à vie' ? '/ mois' : 'à vie'}
                  </Text>
                </View>
              </View>

              <Text style={styles.planDescText}>{plan.description}</Text>

              <View style={styles.planDivider} />

              <View style={styles.featuresList}>
                {plan.features.map((feature, idx) => (
                  <View key={idx} style={styles.featureItem}>
                    <Feather name="check" size={13} color="#4CAF50" style={{ marginRight: 8 }} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity 
                style={[
                  styles.planButton,
                  plan.popular ? styles.planButtonGold : styles.planButtonOutline,
                  isCurrent && styles.planButtonCurrent
                ]}
                onPress={() => handleSelectPlan(plan.id)}
                disabled={isCurrent}
              >
                <Text 
                  style={[
                    styles.planButtonText,
                    plan.popular ? styles.planButtonTextGold : styles.planButtonTextOutline,
                    isCurrent && styles.planButtonTextCurrent
                  ]}
                >
                  {plan.buttonText}
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

      </ScrollView>

      {/* PAYMENT AND SUCCESS MODAL */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          {modalState === 'payment' ? (
            <View style={styles.paymentSheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Choisissez votre moyen de paiement</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close-circle-outline" size={26} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.networksRow}>
                {['orange', 'mtn', 'moov', 'wave'].map((net) => {
                  const isNetSelected = selectedNetwork === net;
                  return (
                    <TouchableOpacity
                      key={net}
                      style={[styles.networkIcon, isNetSelected && styles.networkIconSelected]}
                      onPress={() => setSelectedNetwork(net)}
                    >
                      <Feather 
                        name={net === 'wave' ? 'wifi' : 'credit-card'} 
                        size={24} 
                        color={isNetSelected ? '#4CAF50' : '#7A8B89'} 
                      />
                      <Text style={[styles.networkLabel, isNetSelected && styles.networkLabelActive]}>
                        {net.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.inputLabel}>Numéro de téléphone de facturation</Text>
              <TextInput
                style={styles.phoneInput}
                keyboardType="phone-pad"
                placeholder="Ex: 01 02 03 04 05"
                placeholderTextColor="#7A8B89"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />

              <TouchableOpacity style={styles.confirmBtnPayment} onPress={handleConfirmPayment}>
                <Text style={styles.confirmBtnText}>Confirmer le paiement</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.successModal}>
              <View style={styles.successCard}>
                <View style={styles.successIconCircle}>
                  <Ionicons name="checkmark-circle" size={56} color="#4CAF50" />
                </View>

                <Text style={styles.successTitle}>Paiement réussi !</Text>
                <Text style={styles.successSub}>Votre compte est maintenant premium.</Text>

                <View style={styles.dottedLine} />

                <View style={styles.transactionSection}>
                  <Text style={styles.transactionTitle}>Détails de la transaction</Text>

                  <View style={styles.transactionRow}>
                    <Text style={styles.transactionLabel}>ID transaction</Text>
                    <Text style={styles.transactionValue}>T_E2VD3JG4RRL3KS6</Text>
                  </View>
                  <View style={styles.transactionRow}>
                    <Text style={styles.transactionLabel}>Offre souscrite</Text>
                    <Text style={styles.transactionValue}>{getSelectedPlanDetails().name}</Text>
                  </View>
                  <View style={styles.transactionRow}>
                    <Text style={styles.transactionLabel}>Opérateur</Text>
                    <Text style={styles.transactionValue}>{selectedNetwork.toUpperCase()}</Text>
                  </View>
                  <View style={styles.transactionRow}>
                    <Text style={styles.transactionLabel}>Numéro</Text>
                    <Text style={styles.transactionValue}>{phoneNumber || '0102030405'}</Text>
                  </View>
                  <View style={styles.transactionRow}>
                    <Text style={styles.transactionLabel}>Montant</Text>
                    <Text style={[styles.transactionValue, { color: '#4CAF50' }]}>
                      {getSelectedPlanDetails().price}
                    </Text>
                  </View>
                </View>

                <View style={styles.successButtonsRow}>
                  <TouchableOpacity style={styles.fermerBtn} onPress={handleClose}>
                    <Text style={styles.fermerBtnText}>Fermer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.partagerBtn} onPress={handleClose}>
                    <Text style={styles.partagerBtnText}>Partager</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFBFB',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 10,
    paddingBottom: 40,
  },
  headerBlock: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F4F4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  logoContainerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fs(16),
    fontWeight: '700',
    color: '#182C2A',
  },

  // Bento Header Card
  bentoHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  bentoHeaderLeft: {
    marginBottom: 12,
  },
  bentoHeaderTitle: {
    fontSize: fs(17),
    fontWeight: '800',
    color: '#182C2A',
    marginBottom: 2,
  },
  bentoHeaderSub: {
    fontSize: fs(12),
    color: '#7A8B89',
    fontWeight: '500',
  },
  bentoHeaderRight: {
    alignSelf: 'stretch',
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4CAF50',
    marginRight: 6,
  },
  statusBadgeText: {
    color: '#4CAF50',
    fontWeight: '800',
    fontSize: fs(11),
  },

  // Bento Card
  bentoCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: fs(14),
    fontWeight: '700',
    color: '#182C2A',
  },
  planDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  planDisplayName: {
    fontSize: fs(22),
    fontWeight: '800',
    color: '#182C2A',
  },
  planDisplayPrice: {
    fontSize: fs(16),
    fontWeight: '800',
    color: '#182C2A',
  },
  planDisplayPricePeriod: {
    fontSize: fs(12),
    fontWeight: '500',
    color: '#7A8B89',
  },
  metaDivider: {
    height: 1,
    backgroundColor: '#FAFBFB',
    marginVertical: 14,
  },
  metaItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItemText: {
    fontSize: fs(12),
    color: '#556A68',
    fontWeight: '500',
  },

  // Usage Stats Card
  usageRowsContainer: {
    marginBottom: 14,
  },
  usageRow: {
    marginBottom: 14,
  },
  usageLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  usageLabelText: {
    fontSize: fs(12),
    color: '#556A68',
    fontWeight: '600',
  },
  usageCountText: {
    fontSize: fs(12),
    color: '#182C2A',
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#FAFBFB',
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  usageFooterBox: {
    backgroundColor: '#FAFBFB',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  usageFooterText: {
    fontSize: fs(11),
    color: '#7A8B89',
    textAlign: 'center',
    lineHeight: 15,
    fontWeight: '500',
  },

  // Double Column Bento Row
  doubleBentoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bentoCardMini: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
    justifyContent: 'space-between',
  },
  miniHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  miniCardTitle: {
    fontSize: fs(12),
    fontWeight: '700',
    color: '#7A8B89',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendarBlock: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    width: 65,
    alignSelf: 'center',
    marginVertical: 10,
  },
  calendarMonth: {
    backgroundColor: '#E8F5E9',
    width: '100%',
    paddingVertical: 3,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#C8E6C9',
  },
  calendarMonthText: {
    color: '#4CAF50',
    fontSize: fs(10),
    fontWeight: '800',
  },
  calendarDay: {
    paddingVertical: 4,
  },
  calendarDayText: {
    fontSize: fs(20),
    fontWeight: '800',
    color: '#182C2A',
  },
  calendarYear: {
    paddingBottom: 3,
  },
  calendarYearText: {
    fontSize: fs(9),
    color: '#7A8B89',
    fontWeight: '600',
  },
  calendarStatusText: {
    fontSize: fs(11),
    color: '#F59A23',
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 4,
  },

  // Mini Invoices
  miniInvoicesList: {
    flex: 1,
    justifyContent: 'center',
  },
  invoiceItemMini: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#FAFBFB',
  },
  invoiceItemLeft: {
    flex: 1,
  },
  invoiceIdText: {
    fontSize: fs(10),
    fontWeight: '700',
    color: '#182C2A',
  },
  invoiceDateText: {
    fontSize: fs(9),
    color: '#7A8B89',
    marginTop: 1,
  },
  invoiceDlBtn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FAFBFB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  // Bottom Pricing Section Header
  pricingSectionHeader: {
    marginTop: 12,
    marginBottom: 16,
  },
  pricingSectionTitle: {
    fontSize: fs(18),
    fontWeight: '800',
    color: '#182C2A',
  },

  // Pricing Card
  pricingCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    position: 'relative',
  },
  pricingCardPopular: {
    borderColor: '#F59A23',
    borderWidth: 2,
  },
  pricingCardCurrent: {
    backgroundColor: '#FAFBFB',
    borderColor: '#E2E8F0',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#F59A23',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  popularBadgeText: {
    color: '#FFFFFF',
    fontSize: fs(9),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pricingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  planIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  planTitleContainer: {
    flex: 1,
  },
  planNameText: {
    fontSize: fs(16),
    fontWeight: '800',
    color: '#182C2A',
  },
  planPriceText: {
    fontSize: fs(12),
    color: '#7A8B89',
    marginTop: 1,
  },
  planPriceBold: {
    fontSize: fs(15),
    fontWeight: '800',
    color: '#182C2A',
  },
  planDescText: {
    fontSize: fs(12),
    color: '#556A68',
    lineHeight: 16,
    marginBottom: 14,
  },
  planDivider: {
    height: 1,
    backgroundColor: '#FAFBFB',
    marginBottom: 14,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    fontSize: fs(12),
    color: '#556A68',
    fontWeight: '500',
  },

  // Plan Buttons
  planButton: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  planButtonGold: {
    backgroundColor: '#F59A23',
    borderColor: '#F59A23',
  },
  planButtonOutline: {
    backgroundColor: '#FFFFFF',
    borderColor: '#182C2A',
  },
  planButtonCurrent: {
    backgroundColor: '#EAEAEA',
    borderColor: '#EAEAEA',
  },
  planButtonText: {
    fontWeight: '700',
    fontSize: fs(13),
  },
  planButtonTextGold: {
    color: '#FFFFFF',
  },
  planButtonTextOutline: {
    color: '#182C2A',
  },
  planButtonTextCurrent: {
    color: '#7A8B89',
  },

  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  paymentSheet: {
    backgroundColor: '#182C2A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: fs(14),
  },
  networksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  networkIcon: {
    flex: 1,
    backgroundColor: '#253B39',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  networkIconSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#1E3331',
  },
  networkLabel: {
    color: '#7A8B89',
    fontSize: fs(10),
    fontWeight: '800',
    marginTop: 4,
  },
  networkLabelActive: {
    color: '#4CAF50',
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: fs(12),
    fontWeight: '700',
    marginBottom: 8,
  },
  phoneInput: {
    backgroundColor: '#FFFFFF',
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: '#182C2A',
    fontSize: fs(14),
    marginBottom: 24,
  },
  confirmBtnPayment: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },

  // Success Modal
  successModal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    padding: 24,
    alignItems: 'center',
  },
  successIconCircle: {
    marginBottom: 16,
  },
  successTitle: {
    color: '#182C2A',
    fontWeight: '800',
    fontSize: fs(20),
    marginBottom: 4,
    textAlign: 'center',
  },
  successSub: {
    color: '#556A68',
    fontSize: fs(13),
    marginBottom: 24,
    textAlign: 'center',
  },
  dottedLine: {
    width: '100%',
    height: 1,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  transactionSection: {
    width: '100%',
    marginBottom: 24,
  },
  transactionTitle: {
    color: '#182C2A',
    fontWeight: '700',
    fontSize: fs(14),
    marginBottom: 14,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  transactionLabel: {
    color: '#7A8B89',
    fontSize: fs(13),
  },
  transactionValue: {
    color: '#182C2A',
    fontWeight: '700',
    fontSize: fs(13),
  },
  successButtonsRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  fermerBtn: {
    flex: 1,
    backgroundColor: '#F59A23',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  fermerBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: fs(14),
  },
  partagerBtn: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
  },
  partagerBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: fs(14),
  },
});
