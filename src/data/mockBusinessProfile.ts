import type { StudentBusinessProfile } from '@/types/business';

export const MOCK_USER_ID = 'user_demo_001';

export const mockBusinessProfile: StudentBusinessProfile = {
  id: 'bp_demo_001',
  user_id: MOCK_USER_ID,
  business_name: 'Inmoclick Agencia Inmobiliaria',
  industry: 'Bienes raíces',
  business_model: 'Agencia con corredores propios y referidos',
  target_customer:
    'Familias jóvenes (28–42) buscando primera vivienda en zona metropolitana',
  main_goal: 'Duplicar leads calificados desde marketing digital en 6 meses',
  main_challenge:
    'Los leads de redes sociales no convierten porque la calificación es manual y lenta',
  current_stage: 'Crecimiento temprano',
  country: 'México',
  notes:
    'El equipo no tiene experiencia técnica fuerte. Necesitan procesos simples y plantillas listas para usar.',
  created_at: '2026-04-10T15:30:00.000Z',
  updated_at: '2026-04-25T11:12:00.000Z',
};
