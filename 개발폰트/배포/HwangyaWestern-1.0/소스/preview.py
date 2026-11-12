import sys
from PIL import Image, ImageDraw, ImageFont
m, w, out = sys.argv[1:4]
im = Image.new('RGB', (1200, 640), (250, 247, 238)); d = ImageDraw.Draw(im)
fm = ImageFont.truetype(m, 64); fw = ImageFont.truetype(w, 64)
d.text((30, 20), '겸손할 수 있을 줄 알았다', font=fm, fill=0)
d.text((30, 100), '그런데 힘들다  Hello 123', font=fm, fill=0)
d.text((30, 230), '황야의 카우보이 목장', font=fw, fill=(60, 38, 20))
d.text((30, 320), 'HOWDY Cowboy 1887', font=fw, fill=(60, 38, 20))
d.text((30, 430), '겸손할 수', font=ImageFont.truetype(m, 150), fill=0)
d.text((640, 430), '목장 W', font=ImageFont.truetype(w, 150), fill=(60, 38, 20))
im.save(out)
