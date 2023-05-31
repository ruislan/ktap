import React from 'react';

import { Block } from 'baseui/block';
import { LabelSmall, HeadingSmall } from 'baseui/typography';
import RouterLink from '../../../components/router-link';
import { useParams } from 'react-router-dom';
import { Spinner } from 'baseui/spinner';
import { StatelessAccordion, Panel } from 'baseui/accordion';
import AppDetailInfo from './app-detail-info';
import AppDetailMedia from './app-detail-media';
import AppDetailContact from './app-detail-contact';
import { Styles } from '../../../constants';
import AppDetailTags from './app-detail-tags';
import AppDetailRequirements from './app-detail-requirements';
import AppDetailLanguages from './app-detail-languages';
import AppDetailActions from './app-detail-actions';
import AppDetailOrganizations from './app-detail-organizations';
import AppDetailProReviews from './app-detail-pro-reviews';
import AppDetailAwards from './app-detail-awards';

function AdminPanelAppDetail() {
    const { id } = useParams();
    const [expanded, setExpanded] = React.useState(['p0']);
    const [isLoading, setIsLoading] = React.useState(false);
    const [data, setData] = React.useState(null);
    const fetchData = React.useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`/admin/apps/${id}`);
            if (res.ok) {
                const json = await res.json();
                setData(json.data);
            }
        } finally {
            setIsLoading(false);
        }
    }, [id]);
    React.useEffect(() => {
        fetchData();
    }, [fetchData]);
    return (
        <Block display='flex' flexDirection='column' paddingLeft='scale600' paddingRight='scale600'>
            <Block display='flex' alignItems='baseline' justifyContent='space-between'>
                <HeadingSmall marginTop='0' marginBottom='scale900'>游戏管理</HeadingSmall>
                <LabelSmall><RouterLink href='/admin-panel/apps' kind='underline'>返回列表</RouterLink></LabelSmall>
            </Block>
            <Block display='flex' justifyContent='flex-start'>
                {isLoading
                    ? <Block marginTop='scale900' width='100%' display='flex' alignItems='center' justifyContent='center'><Spinner $size='scale1600' $borderWidth='scale200' /></Block>
                    : (data && (
                        <Block display='flex' flexDirection='column' width='100%'>
                            <StatelessAccordion accordion={false} expanded={expanded} onChange={({ expanded }) => setExpanded(expanded)}>
                                <Panel key='p0' title='快速操作' overrides={Styles.Accordion.Panel}><AppDetailActions data={data} onChanged={() => fetchData()} /></Panel>
                                <Panel key='p1' title='基本信息' overrides={Styles.Accordion.Panel}><AppDetailInfo data={data} onChanged={() => fetchData()} /></Panel>
                                <Panel key='p2' title='组织信息' overrides={Styles.Accordion.Panel}><AppDetailOrganizations data={data} /></Panel>
                                <Panel key='p3' title='视觉信息' overrides={Styles.Accordion.Panel}><AppDetailMedia data={data} /></Panel>
                                <Panel key='p4' title='分类信息' overrides={Styles.Accordion.Panel}><AppDetailTags data={data} /></Panel>
                                <Panel key='p5' title='联系信息' overrides={Styles.Accordion.Panel}><AppDetailContact data={data} /></Panel>
                                <Panel key='p6' title='系统需求' overrides={Styles.Accordion.Panel}><AppDetailRequirements data={data} /></Panel>
                                <Panel key='p7' title='支持语言' overrides={Styles.Accordion.Panel}><AppDetailLanguages data={data} /></Panel>
                                <Panel key='p8' title='专业评测' overrides={Styles.Accordion.Panel}><AppDetailProReviews data={data} /></Panel>
                                <Panel key='p9' title='获得荣誉' overrides={Styles.Accordion.Panel}><AppDetailAwards data={data} /></Panel>
                            </StatelessAccordion>
                        </Block>
                    ))
                }
            </Block>
        </Block>
    );
}

export default AdminPanelAppDetail;