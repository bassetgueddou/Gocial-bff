# BACKLOG GOCIAL — Sprint Cycle 2

> Mis à jour le 2026-03-20 après QA Cycle 2

---

## [CRITIQUE] — Bloquent l'utilisation (Cycle 1 — DONE)

- [x] TASK-01 : `int(get_jwt_identity())` manquant dans auth.py | Agent Backend
- [x] TASK-02 : Filtres Home — FilterContext + câblage modals + useActivities | Agent Intégrateur
- [x] TASK-03 : Recherche textuelle backend (param search) | Agent Backend
- [x] TASK-04 : NotificationsPerson câblé API | Agent Frontend
- [x] TASK-05 : AccountPrivacyPerson câblé API | Agent Frontend
- [x] TASK-06 : ModifActivityOverview données réelles | Agent Frontend
- [x] TASK-07 : Types User manquants | Agent Intégrateur
- [x] TASK-09 : MyDiary Promise.allSettled | Agent Intégrateur
- [x] TASK-16 : Message erreur date corrigé | Agent Backend

## [CRITIQUE] — Cycle 2

- [ ] TASK-23 : ChangePassword — aligner validation frontend sur backend (8 chars, maj, min, chiffre, PAS de special) | Agent Frontend
- [ ] TASK-24 : Bouton "Rejoindre la visio" — Linking.openURL(activity.link) | Agent Frontend

## [MAJEUR] — Cycle 2

- [ ] TASK-25 : ShareModal complet — Clipboard + Share.share() + activityId + boutons sociaux + inviter amis | Agent Frontend
- [ ] TASK-26 : TypeMessageView — Supprimer/Bloquer/Signaler câblés + FlatList inverted | Agent Frontend
- [ ] TASK-27 : Discoveries proasso — inclure type "asso" en plus de "pro" | Agent Frontend
- [ ] TASK-28 : CaNumberParticipants — switch parité séparé de isDarkMode | Agent Frontend
- [ ] TASK-29 : Girls Only + Dark mode sync backend dans GeneralParameter | Agent Frontend
- [ ] TASK-30 : HomeMap — connecter aux données réelles via useActivities | Agent Frontend
- [ ] TASK-31 : WhatModal multi-catégorie — backend support IN clause ou split virgule | Agent Backend
- [ ] TASK-32 : WhereModal "Autour de moi" — Geolocation.getCurrentPosition pour lat/lng | Agent Frontend
- [ ] TASK-33 : hostType filter — backend param + useActivities forwarding | Agent Backend

## [MINEUR] — Cycle 2

- [ ] TASK-18 : Accents manquants dans toute l'UI (~20+ fichiers) | Agent UI/UX
- [ ] TASK-19 : CaTitle/CARealInformation — pré-remplir depuis formData | Agent Frontend
- [ ] TASK-20 : ParticipationPendingHost/ValidatedHost — Alert.alert → Toast | Agent Frontend
- [ ] TASK-21 : useFriends — catch blocks silencieux → Toast erreur | Agent Intégrateur
- [ ] TASK-22 : DateModal — données hardcodées → vraies activités | Agent Frontend
- [ ] POLISH-01 : Dark mode WhereModal (textes "0 km"/"200 km") | Agent UI/UX
- [ ] POLISH-02 : FilterBar label "Ou ?" → "Où ?" | Agent UI/UX

## [FEATURE] — Backlog

- [ ] FEAT-01 : Upload image activité | Agent Backend + Frontend
- [ ] FEAT-02 : Évaluations post-activité | Agent Backend + Frontend
- [ ] FEAT-03 : Pagination / infinite scroll | Agent Frontend
- [ ] FEAT-04 : Compteurs non-lus badges BottomTab | Agent Intégrateur
