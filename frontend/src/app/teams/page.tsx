'use client';

import { useState, useEffect } from 'react';
import { teamsApiService, Team } from '../../services/teams.service';
import { toast } from 'react-hot-toast';

// Dados dos pilotos por equipe (baseado na imagem)
const teamPilots: Record<string, { pilot1: string; pilot2: string }> = {
  'McLaren': { pilot1: 'Oscar PIASTRI', pilot2: 'Lando NORRIS' },
  'Mercedes': { pilot1: 'George RUSSELL', pilot2: 'Kimi ANTONELLI' },
  'Red Bull Racing': { pilot1: 'Max VERSTAPPEN', pilot2: 'Yuki TSUNODA' },
  'Ferrari': { pilot1: 'Charles LECLERC', pilot2: 'Lewis HAMILTON' },
  'Williams': { pilot1: 'Alexander ALBON', pilot2: 'Carlos SAINZ' },
  'Racing Bulls': { pilot1: 'Liam LAWSON', pilot2: 'Isack HADJAR' },
  'Aston Martin': { pilot1: 'Fernando ALONSO', pilot2: 'Lance STROLL' },
  'Alpine': { pilot1: 'Pierre GASLY', pilot2: 'Franco COLAPINTO' },
  'Haas F1 Team': { pilot1: 'Esteban OCON', pilot2: 'Oliver BEARMAN' },
  'Kick Sauber': { pilot1: 'Nico HULKENBERG', pilot2: 'Gabriel BORTOLETO' }
};

// Mapear cores mais precisas baseadas na imagem
const teamColorsMap: Record<string, string> = {
  'McLaren': '#FF8700',
  'Mercedes': '#00D2BE', 
  'Red Bull Racing': '#0600EF',
  'Ferrari': '#DC0000',
  'Williams': '#005AFF',
  'Racing Bulls': '#6692FF',
  'Aston Martin': '#006F62',
  'Alpine': '#0090FF',
  'Haas F1 Team': '#FFFFFF',
  'Kick Sauber': '#52E252'
};

// Mapeamento específico para nomes de arquivos de imagens
const teamImageNameMap: Record<string, string> = {
  'McLaren': 'mclaren',
  'Mercedes': 'mercedes',
  'Red Bull Racing': 'redbullracing',
  'Ferrari': 'ferrari',
  'Williams': 'williams',
  'Racing Bulls': 'racingbulls',
  'Aston Martin': 'astonmartin',
  'Alpine': 'alpine',
  'Haas F1 Team': 'haasf1team',
  'Kick Sauber': 'kicksauber'
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const teamsData = await teamsApiService.getAllTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      toast.error('Erro ao carregar equipes. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="relative py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-wider text-white">
              EQUIPES F1
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-medium">
              Descubra todas as equipes da Fórmula 1 para a temporada 2025
            </p>
          </div>
        </div>
      </div>

      {/* Teams Grid - Layout similar to the image */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {teams.map((team) => {
            const pilots = teamPilots[team.name] || { pilot1: 'TBD', pilot2: 'TBD' };
            const teamColor = teamColorsMap[team.name] || team.teamColor || '#FF0000';
            
            return (
              <div
                key={team.id}
                className="relative overflow-hidden rounded-lg bg-black border-2 hover:scale-105 transition-all duration-300 group cursor-pointer h-80"
                style={{
                  borderColor: teamColor,
                  background: `linear-gradient(135deg, ${teamColor}15 0%, black 50%, black 100%)`
                }}
              >
                {/* Header com logo e cor */}
                <div className="absolute top-0 left-0 right-0 p-4 z-10">
                  <div className="flex items-center justify-between mb-3">
                    <img 
                      src={team.logoUrl || `/team-logos/2025${teamImageNameMap[team.name] || team.name.toLowerCase().replace(/\s+/g, '')}logowhite.avif`}
                      alt={`${team.name} logo`}
                      className="h-6 w-auto filter brightness-0 invert"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div 
                      className="w-3 h-8"
                      style={{ backgroundColor: teamColor }}
                    ></div>
                  </div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider leading-tight">
                    {team.name}
                  </h3>
                </div>

                {/* Pilotos */}
                <div className="absolute top-20 left-4 right-4 z-10">
                  <div className="space-y-1">
                    <div className="text-xs text-white font-semibold uppercase tracking-wide">
                      {pilots.pilot1.split(' ').slice(-1)[0]}
                    </div>
                    <div className="text-xs text-white font-semibold uppercase tracking-wide">
                      {pilots.pilot2.split(' ').slice(-1)[0]}
                    </div>
                  </div>
                </div>

                {/* Imagem do carro - maior e mais proeminente */}
                <div className="absolute bottom-0 right-0 left-0 h-48 z-0">
                  <img 
                    src={team.carImageUrl || `/team-cars/2025${teamImageNameMap[team.name] || team.name.toLowerCase().replace(/\s+/g, '')}carright.avif`}
                    alt={`${team.name} car`}
                    className="absolute bottom-0 right-0 h-full w-auto object-contain opacity-90 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>

                {/* Gradient overlay */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `linear-gradient(45deg, ${teamColor}20 0%, transparent 30%, transparent 70%, ${teamColor}10 100%)`
                  }}
                ></div>

                {/* Hover accent */}
                <div 
                  className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  style={{ backgroundColor: teamColor }}
                ></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}