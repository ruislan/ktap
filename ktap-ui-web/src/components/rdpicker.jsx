import { PropTypes } from 'prop-types';

import { useStyletron } from 'baseui';
import { StatefulPopover } from 'baseui/popover';

import { DayPicker } from 'react-day-picker';
import zh from 'date-fns/locale/zh-CN';
import 'react-day-picker/dist/style.css';
import '@ktap/assets/css/rdp.css';

import { DateTime } from '@ktap/libs/utils';

RdPicker.propTypes = {
    mode: PropTypes.string,
    value: PropTypes.instanceOf(Date),
    onSelect: PropTypes.func,
};

function RdPicker({ mode, value, onSelect = () => { } }) {
    const [css, theme] = useStyletron();
    return (
        <StatefulPopover content={
            <DayPicker captionLayout='dropdown-buttons' fromYear={1970} toYear={2070} mode={mode} locale={zh} defaultMonth={value} selected={value} onDayClick={onSelect} />
        } placement='top'>
            <div className={css({
                border: '2px solid transparent', borderRadius: theme.sizing.scale300,
                lineHeight: theme.sizing.scale700, backgroundColor: 'rgb(41, 41, 41)',
            })}>
                <input className={css({
                    minWidth: 0, borderWidth: 0, borderStyle: 'none', outline: 'none',
                    backgroundColor: 'transparent', color: 'inherit', cursor: 'pointer',
                    paddingLeft: theme.sizing.scale550, paddingRight: theme.sizing.scale550,
                    paddingTop: theme.sizing.scale200, paddingBottom: theme.sizing.scale200,
                    width: '100%', boxSizing: 'border-box',
                    lineHeight: theme.sizing.scale700, fontSize: theme.typography.LabelSmall.fontSize,
                    fontWeight: theme.typography.LabelSmall.fontWeight, fontFamily: theme.typography.LabelSmall.fontFamily,
                })} value={DateTime.formatShort(value)} readOnly />
            </div>
        </StatefulPopover>
    );
}

export default RdPicker;






