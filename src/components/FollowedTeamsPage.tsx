// components/FollowedTeamsPage.tsx
import React, { useState, useMemo } from 'react';
import { FollowedTeam, Team, TeamLevel } from '../types';

interface FollowedTeamsPageProps {
  followedTeams: FollowedTeam[];
  onSelectTeam: (team: Team) => void;
  onToggleFavorite: (teamId: string) => void;
  onUnfollow: (team: Team) => void; // Using Team object to unfollow
  allTeams: Team[]; // To search for new teams to follow
  managedTeamId?: string;
}

const prefectures = ['東京都', '大阪府', '福岡県', '北海道', '神奈川県', /* ... other prefectures ... */ ]; // Simplified list

const FollowedTeamsPage: React.FC<FollowedTeamsPageProps> = ({ 
    followedTeams, onSelectTeam, onToggleFavorite, onUnfollow, allTeams, managedTeamId 
}) => {
  const [filterPrefecture, setFilterPrefecture] = useState('');
  const [filterCity, setFilterCity] = useState(''); // For simplicity, city filter is text input
  const [searchTerm, setSearchTerm] = useState(''); // For team name search

  const handleChat = (team: Team) => {
    alert(`${team.name}とのチャットを開始します。`);
  };

  const filteredFollowedTeams = useMemo(() => {
    return followedTeams.filter(team => {
      const prefectureMatch = filterPrefecture ? team.prefecture === filterPrefecture : true;
      const cityMatch = filterCity ? (team.city || '').toLowerCase().includes(filterCity.toLowerCase()) : true;
      const nameMatch = searchTerm ? team.name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
      return prefectureMatch && cityMatch && nameMatch;
    });
  }, [followedTeams, filterPrefecture, filterCity, searchTerm]);

  return (
    <div className="space-y-4">

      <div className="bg-slate-800 p-4 sm:p-6 rounded-xl shadow-xl space-y-3 sm:space-y-4 md:flex md:flex-wrap md:gap-3 items-end">
        <div>
          <label htmlFor="filterPrefecture" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">都道府県</label>
          <select id="filterPrefecture" value={filterPrefecture} onChange={(e) => setFilterPrefecture(e.target.value)}
            className="w-full md:w-auto bg-slate-700 border border-slate-600 text-white rounded-md p-1.5 sm:p-2 text-xs sm:text-sm focus:ring-sky-500 focus:border-sky-500">
            <option value="">すべて</option>
            {prefectures.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="filterCity" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">市区町村</label>
          <input type="text" id="filterCity" value={filterCity} onChange={(e) => setFilterCity(e.target.value)} placeholder="例: 渋谷区"
            className="w-full md:w-auto bg-slate-700 border border-slate-600 text-white rounded-md p-1.5 sm:p-2 text-xs sm:text-sm focus:ring-sky-500 focus:border-sky-500" />
        </div>
        <div>
          <label htmlFor="searchTerm" className="block text-xs sm:text-sm font-medium text-slate-300 mb-1">チーム名検索</label>
          <input type="text" id="searchTerm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="チーム名..."
            className="w-full md:w-auto bg-slate-700 border border-slate-600 text-white rounded-md p-1.5 sm:p-2 text-xs sm:text-sm focus:ring-sky-500 focus:border-sky-500" />
        </div>
      </div>

      {filteredFollowedTeams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredFollowedTeams.map(team => (
            <div key={team.id} className={`bg-slate-800 rounded-lg shadow-xl overflow-hidden border ${team.isFavorite ? 'border-yellow-500' : 'border-slate-700'} flex flex-col`}>
              <div className="h-20 sm:h-24 w-full overflow-hidden cursor-pointer" onClick={() => onSelectTeam(team)}>
                <img src={team.logoUrl} alt={`${team.name} ロゴ`} className="w-full h-full object-cover" />
              </div>
              <div className="p-2 sm:p-2.5 flex flex-col flex-grow">
                <h3 className="text-sm sm:text-base font-semibold text-sky-400 mb-0.5 truncate cursor-pointer hover:underline" onClick={() => onSelectTeam(team)}>{team.name}</h3>
                
                <p className="text-xs text-slate-400 mb-0.5 truncate">{team.prefecture}{team.city ? `, ${team.city}` : ''}</p>
                
                <p className="text-xs text-slate-500 mb-1">
                  L: {team.level.substring(0,2)} | R: {team.rating}
                </p>
                
                <p className="text-xs text-slate-500 mb-1.5 sm:mb-2">
                  空き: <span className="font-semibold">{team.availableSlotsText || '-'}</span>
                </p>
                
                <div className="space-y-1 mt-auto">
                  <div className="flex gap-1">
                    <button onClick={() => onSelectTeam(team)} className="flex-1 text-xs bg-sky-600 hover:bg-sky-700 text-white font-medium py-2 px-2.5 rounded-md transition">
                      詳細
                    </button>
                    <button onClick={() => handleChat(team)} className="flex-1 text-xs bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-2.5 rounded-md transition">
                      チャット
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onToggleFavorite(team.id)} className={`w-1/2 text-xs font-medium py-2 px-2 rounded-md transition ${team.isFavorite ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-slate-700 hover:bg-slate-600'}`}>
                      {team.isFavorite ? '★解除' : '☆追加'}
                    </button>
                    <button onClick={() => onUnfollow(team)} className="w-1/2 text-xs bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-2 rounded-md transition">
                      解除
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-400 text-lg sm:text-xl py-8 sm:py-10">条件に合うフォロー中のチームはありません。</p>
      )}
      

    </div>
  );
};

export default FollowedTeamsPage;




