set -e
for w in Regular:400 Bold:700; do n=${w%%:*}; python build2.py ../src/NotoSerifKR-${w#*:}.ttf v2/Cheonui-$n.ttf $n 2>&1 | grep -E "saved|Error" ; done
python -c "
from fontTools.ttLib import TTFont
for w in ('Regular','Bold'):
    f=TTFont('v2/Cheonui-%s.ttf'%w); f.flavor='woff2'; f.save('v2/Cheonui-%s.woff2'%w)
"
