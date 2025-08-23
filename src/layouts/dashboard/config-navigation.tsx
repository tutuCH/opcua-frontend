import { Cog, Sheet, Factory, CloudAlert, Settings } from 'lucide-react';
import SvgColor from 'src/components/svg-color';
// ----------------------------------------------------------------------

const icon = (name: string) => (
  <SvgColor src={`/assets/icons/navbar/${name}.svg`} sx={{ width: 1, height: 1 }} />
);

const navConfig = [
  {
    title: '工廠',
    path: '/factory',
    icon: <Factory size={24} />,
  },
  {
    title: '機台',
    path: '/machine',
    icon: <Cog size={24} />,
  },
  {
    title: '操作日誌',
    path: '/records',
    icon: <Sheet size={24} />,
  },
  {
    title: '警告',
    path: '/warnings',
    icon: <CloudAlert size={24} />,
  },
  {
    title: '設定',
    path: '/settings',
    icon: <Settings size={24} />,
  }

  // {
  //   title: 'login',
  //   path: '/login',
  //   icon: icon('ic_lock'),
  // },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: icon('ic_disabled'),
  // },
];

export default navConfig;
