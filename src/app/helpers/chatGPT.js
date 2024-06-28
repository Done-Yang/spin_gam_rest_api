const OpenAI = require("openai");

const openai = new OpenAI({
  organization: process.env.ORGANIZATION_ID,
  project: process.env.PROJECT_ID,
  apiKey: process.env.API_KEY,
});

const promptText = `I will upload a photo of the restaurant flyer for you to check the photo and then reply in a JSON format

Languages in Bill are Lao, English

condition 1
Response in JSON format
{
    "billNo" : string,
    "restaurantNo": string,
    "restaurantName" : string,
    "date" : string,
    "phone": string,
    "table": string, 
    "total" : number,
    "orders" : [
        {
            "productNo": number | null,
            "product" : string,
            "amount" : number,
            "price" : number
            "match" : boolean,
            "nameMatch" : string | null
        }
    ]
}

billNo is bill number
If the bill does not have a bill number, set billNo = null

Focus on the name of the restaurant on the bill, bring out the logo, if contian logo and restaurant name please select the name not the name in logo.
If more than 50% of them look like a match, show the name of the restaurant that matches (name in the list)
restaurantName = ( one name match name in list restaurant name)



// -- list restaurant name --
var restaurantNames = [
  {"restaurantNo": "CD-VTE-6282", "restaurantName":	"ຕຳມົ້ວ"},
  {"restaurantNo": "CD-VTE-35644", "restaurantName":	"Windy Café Bar & Restaurant"},
  {"restaurantNo": "CDVTE2310300921", "restaurantName":	"Red Door"},
  {"restaurantNo": "CD-VTE-36836", "restaurantName":	"Vientiane Billiards Louge"},
  {"restaurantNo": "CD-VTE-7971", "restaurantName":	"Dplus ENTERTAINMENT"},
  {"restaurantNo": "CD-VTE-9758", "restaurantName":	"PHASALAO KITCHEN & BAR"},
  {"restaurantNo": "CD-VTE-7121", "restaurantName":	"Rustic White"},
  {"restaurantNo": "CD-VTE-26306", "restaurantName":	"Godunk"},
  {"restaurantNo": "CD-VTE-8068", "restaurantName":	"Galloria Coffee and Bar"},
  {"restaurantNo": "CDVTE2403272758", "restaurantName":	"Cup House"},
  {"restaurantNo": "CD-VTE-32860", "restaurantName":	"ຮ້ານອາຫານ ເຍົາວະລາດ"},
  {"restaurantNo": "CD-VTE-27012", "restaurantName":	"Intro Bar"},
  {"restaurantNo": "CD-VTE-35342", "restaurantName":	"Bill"},
  {"restaurantNo": "CD-VTE-9395", "restaurantName":	"Vientian tennis club"},
  {"restaurantNo": "CD-VTE-17516", "restaurantName":	"ໂຣແມນຕິກ ຊີຕີ້"},
  {"restaurantNo": "CD-VTE-35671", "restaurantName":	"Fire Tiger"},
  {"restaurantNo": "CD-VTE-29241", "restaurantName":	"Six Pack"},
  {"restaurantNo": "CD-VTE-31012", "restaurantName":	"999 ປາກເຊເດີ 3"},
  {"restaurantNo": "CD-VTE-32569", "restaurantName":	"ຮ້ານອາການ ຕັ້ງຫຼັກ"},
  {"restaurantNo": "CD-VTE-35285", "restaurantName":	"ເນເຈີ"},
  {"restaurantNo": "CD-VTE-36494", "restaurantName":	"Godrunk"},
  {"restaurantNo": "CD-VTE-7670", "restaurantName":	"Mekhong Garage bar"},
  {"restaurantNo": "CD-VTE-36584", "restaurantName":	"Beercamp"},
  {"restaurantNo": "CDVTE2312191324", "restaurantName":	"Mini café and Bar"},
  {"restaurantNo": "CD-VTE-36972", "restaurantName":	"ຮ້ານອາຫານອິນພຸດ"},
  {"restaurantNo": "CD-VTE-12565", "restaurantName":	"Hongbeer Samdao"},
  {"restaurantNo": "CD-VTE-36477", "restaurantName":	"Friendly Restaurant"},
  {"restaurantNo": "CD-VTE-36288", "restaurantName":	"Songluay Restaurant & Bar"},
  {"restaurantNo": "CD-VTE-27623", "restaurantName":	"TULLY'S IRISH PUB"},
  {"restaurantNo": "CDVTE2402211438", "restaurantName":	"Nua Bar & Restaurant"},
  {"restaurantNo": "CD-VTE-7947", "restaurantName":	"face to face"},
  {"restaurantNo": "CDVTE2401170915", "restaurantName":	"Homsa Camp"},
  {"restaurantNo": "CD-VTE-33978", "restaurantName":	"Dope42"},
  {"restaurantNo": "CDVTE2312264458", "restaurantName":	"ຮ້ານ SHANGHAI"},
  {"restaurantNo": "CD-VTE-35283", "restaurantName":	"ແຄ໋ດມູນ (Cat's moon)"},
  {"restaurantNo": "CD-VTE-36084", "restaurantName":	"Day & Nite Restaurant"},
  {"restaurantNo": "CD-VTE-15896", "restaurantName":	"Relax"},
  {"restaurantNo": "CD-VTE-29849", "restaurantName":	"Yaowarat Restaurant"},
  {"restaurantNo": "CD-VTE-4620", "restaurantName":	"Waiywan Restaurant"},
  {"restaurantNo": "CD-VTE-26997", "restaurantName":	"Moon Bar"},
  {"restaurantNo": "CD-VTE-34755", "restaurantName":	"ຮ້ານ Finn"},
  {"restaurantNo": "CD-VTE-35867", "restaurantName":	"View Bar&Restaurant"},
  {"restaurantNo": "CD-VTE-4913", "restaurantName":	"DOME"},
  {"restaurantNo": "CD-VTE-36720", "restaurantName":	"Vagas"},
  {"restaurantNo": "CD-VTE-14049", "restaurantName":	"Golf Luk6"},
  {"restaurantNo": "CD-VTE-32706", "restaurantName":	"Naked Espresso Garden"},
  {"restaurantNo": "CD-VTE-16560", "restaurantName":	"Mark2"},
  {"restaurantNo": "CD-VTE-15950", "restaurantName":	"Wind west pub"},
  {"restaurantNo": "CD-VTE-35942", "restaurantName":	"Hard Rock Café"},
  {"restaurantNo": "CD-VTE-3728", "restaurantName":	"Khopchaideu Vientiane"},
  {"restaurantNo": "CD-VTE-35165", "restaurantName":	"Mekhong River park"},
  {"restaurantNo": "CD-VTE-36990", "restaurantName":	"Sugar Bar & Restaurant Vientiane"},
  {"restaurantNo": "CDVTE2312085542", "restaurantName":	"SALANAE BISTRO & BAR"},
  {"restaurantNo": "CDVTE2402062158", "restaurantName":	"The history 1975 bar"},
  {"restaurantNo": "CD-VTE-27437", "restaurantName":	"Light House"},
  {"restaurantNo": "CDVTE2404221251", "restaurantName":	"The Red Chamber (ຫໍນັ່ງລົມ)"},
  {"restaurantNo": "CD-VTE-27529", "restaurantName":	"Moon light lounge"},
  {"restaurantNo": "CDVTE2401165609", "restaurantName":	"Red B Hostel & Bar"},
  {"restaurantNo": "CD-VTE-2079", "restaurantName":	"Kong View Restaurant"},
  {"restaurantNo": "CD-VTE-12907", "restaurantName":	"ຮ້ານປີ້ງເປັດນາໄຊ"},
  {"restaurantNo": "CD-VTE-0278", "restaurantName":	"ຮ້ານປີ້ງເປັດຫວາດສະໜາ ຫຼັກ 14"},
  {"restaurantNo": "CD-VTE-14282", "restaurantName":	"ຮ້ານອາຫານ ລັດສະໝີຊີ້ນດາດ ສາຂາ5"},
  {"restaurantNo": "CD-VTE-34683", "restaurantName":	"ວັນວານ-WanWan Food Park"},
  {"restaurantNo": "CD-VTE-3449", "restaurantName":	"ຮ້ານອາຫານ ນິວ ລຳເນົາ"},
  {"restaurantNo": "CD-VTE-20079", "restaurantName":	"ຮ້ານອາຫານ ແລະ ເຄື່ອງດື່ມ ອ້າຍເອງ"},
  {"restaurantNo": "CD-VTE-16834", "restaurantName":	"ຮ້ານປີ້ງເປັດ ແອນນາ"},
  {"restaurantNo": "CD-VTE-16010", "restaurantName":	"ຮ້ານຕຳ​ໝີ່ດອນ​ຈັນ"},
  {"restaurantNo": "CD-VTE-4974", "restaurantName":	"ຮ້ານ ກະ​ແລ ຊີ້ນດາດ"},
  {"restaurantNo": "CD-VTE-31038", "restaurantName":	"ຮ້ານຊີ້ນດາດໂຕໝູສາຂາແຄມຂອງ"},
  {"restaurantNo": "CD-VTE-9601", "restaurantName":	"ສວນອາຫານ ສາມ ພ.ພ.ພ"},
  {"restaurantNo": "CD-VTE-8535", "restaurantName":	"ຮ້ານອາຫານສວນອ້າຍເອງ"},
  {"restaurantNo": "CD-VTE-13260", "restaurantName":	"ມຸກມິວ ທິວທັດ"},
  {"restaurantNo": "CD-VTE-11183", "restaurantName":	"Inpeng 1"},
  {"restaurantNo": "CD-VTE-20228", "restaurantName":	"ຮ້ານອາຫານຮັບຊັບ"},
  {"restaurantNo": "CD-VTE-16966", "restaurantName":	"ຮ້ານອາຫານ ໂດລ້າ"},
  {"restaurantNo": "CD-VTE-32318", "restaurantName":	"ຮ້ານອາຫານ ມາຊິວ"},
  {"restaurantNo": "CD-VTE-32590", "restaurantName":	"ຮ້ານລີໂອ ເບຍສົດ"},
  {"restaurantNo": "CD-VTE-36555", "restaurantName":	"ຮ້ານອາຫານ TOP ONE"},
  {"restaurantNo": "CD-VTE-9033", "restaurantName":	"ຮ້ານອາຫານ ພ້ອມເພງ"},
  {"restaurantNo": "CD-VTE-34918", "restaurantName":	"ສວນອາຫານ ຊັບທະວີ"},
  {"restaurantNo": "CD-VTE-36251", "restaurantName":	"ເລີ່ມຕົ້ນບອນເກົ່າສະມາຍໂລໂຊ"},
  {"restaurantNo": "CD-VTE-8550", "restaurantName":	"ສວນອາຫານ ອາເມຊິງ"},
  {"restaurantNo": "CD-VTE-32723", "restaurantName":	"ຫຼັງບ້ານ"},
  {"restaurantNo": "CD-VTE-35576", "restaurantName":	"A-51"},
  {"restaurantNo": "CD-VTE-15769", "restaurantName":	"ຮ້ານ ລີວິວ"},
  {"restaurantNo": "CD-VTE-35750", "restaurantName":	"ຮ້ານ ນ໋ອຍເບຍສົດ ໜອງຫນ່ຽງ"},
  {"restaurantNo": "CD-VTE-29389", "restaurantName":	"ຮ້ານ ນ໋ອຍເບຍສົດ ສາຂາພະຂາວ"},
  {"restaurantNo": "CD-VTE-32554", "restaurantName":	"Happy Night Restaurant and music flok"},
  {"restaurantNo": "CD-VTE-16596", "restaurantName":	"ຮ້ານອາຫານ ລັດສະໝີ ຊີ້ນດາດ"},
  {"restaurantNo": "CD-VTE-18394", "restaurantName":	"ຮ້ານປີ້ງແບ້ ສຸດານີ"},
  {"restaurantNo": "CD-VTE-35955", "restaurantName":	"ຮ້ານລາວາເບຍ"},
  {"restaurantNo": "CD-VTE-10794", "restaurantName":	"NARBAN RESTAURANT"},
  {"restaurantNo": "CD-VTE-36934", "restaurantName":	"ຮັນນີ້ ເບຍສົດ"},
  {"restaurantNo": "CD-VTE-35208", "restaurantName":	"BB Restaurant"},
  {"restaurantNo": "CD-VTE-29763", "restaurantName":	"ຮ້ານ ປີ້ງເປັດ ຕຸກຕາ"},
  {"restaurantNo": "CD-VTE-10774", "restaurantName":	"ຮ້ານ ສະຫວັນປີ້ງແບ້-ເບຍສົດ"},
  {"restaurantNo": "CD-VTE-10340", "restaurantName":	"ຮ້ານ ນ໋ອຍເບຍສົດ ດອນຕິ້ວ"},
  {"restaurantNo": "CD-VTE-16869", "restaurantName":	"​ເຮື​ອນ​ແພ​ອຸ່ນ​ຄຳ"},
  {"restaurantNo": "CD-VTE-16777", "restaurantName":	"ເຮືອນແພ​ລາວ​ເດີມ ຊົມງື່ມ"},
  {"restaurantNo": "CD-VTE-18062", "restaurantName":	"ຮ້ານສະຫວັນປີ້ງແບ້"},
  {"restaurantNo": "CD-VTE-14120", "restaurantName":	"ຮ້ານອາຫານຊົມບຶງ"},
  {"restaurantNo": "CD-VTE-33075", "restaurantName":	"Bor Pen Nyang Restaurant"},
  {"restaurantNo": "CD-VTE-11651", "restaurantName":	"A-one Restaurant"},
  {"restaurantNo": "CD-VTE-35486", "restaurantName":	"ແອບແຊັບ ຊີ້ນດາດ"},
  {"restaurantNo": "CD-VTE-18971", "restaurantName":	"ແຈ໋ກປີ້ງແບ້"},
  {"restaurantNo": "CD-VTE-31044", "restaurantName":	"ຮ້ານອາຫານ ເບປີ້ງແບ້ ສະຫວັນ"},
  {"restaurantNo": "CD-VTE-17992", "restaurantName":	"ປີ້ງແບ້ ແກ້ວຄູນ"},
  {"restaurantNo": "CD-VTE-11470", "restaurantName":	"ຮ້ານ ຕົ້ນຮັກ"},
  {"restaurantNo": "CD-VTE-34588", "restaurantName":	"ຮ້ານປີ້ງແບ້ຊ້າງເຜືອກ"},
  {"restaurantNo": "CD-VTE-2256", "restaurantName":	"ສາຍໃຈ"},
  {"restaurantNo": "CD-VTE-15148", "restaurantName":	"ປີ້ງເປັດ ເຈົ້າເກົ່າ"},
  {"restaurantNo": "CD-VTE-13844", "restaurantName":	"ຮ້ານປີ້ງແບ້ ໂນນຂີ້ເຫຼັກ"},
  {"restaurantNo": "CD-VTE-16552", "restaurantName":	"ຮ້ານອາຫານ 3ແຍກປາກປ່າສັກ.4"},
  {"restaurantNo": "CD-VTE-8511", "restaurantName":	"ງົວປິ່ນໂນນຂີ້ເຫລັກ/ນິຕິຍາ"},
  {"restaurantNo": "CD-VTE-32997", "restaurantName":	"ບາງຮັກ"},
  {"restaurantNo": "CD-VTE-7862", "restaurantName":	"ທິງ ທິງ ປີ້ງເປັດ ທົງປົ່ງ"},
  {"restaurantNo": "CD-VTE-16561", "restaurantName":	"ຊົມ​ດາວ"},
  {"restaurantNo": "CD-VTE-34479", "restaurantName":	"ຮ້ານ ອາຫານ ຊອຍນິຍົມ"},
  {"restaurantNo": "CD-VTE-34734", "restaurantName":	"ຮ້ານ ນ໋ອຍເບຍສົດ 3"},
  {"restaurantNo": "CD-VTE-2237", "restaurantName":	"ຮ້ານຕົ້ນຄູນ"},
  {"restaurantNo": "CD-VTE-15228", "restaurantName":	"ຮ້ານ ອາຫານ ນ້ອງນ້ອຍ"},
  {"restaurantNo": "CD-VTE-9973", "restaurantName":	"ຮ້ານ ປິງເປັດດອນແດງ"},
  {"restaurantNo": "CD-VTE-35636", "restaurantName":	"ຮ້ານອາຫານຊົມນາ"},
  {"restaurantNo": "CD-VTE-7113", "restaurantName":	"ຮ້ານອາຫານ ຫົງຢວນ"},
  {"restaurantNo": "CD-VTE-13589", "restaurantName":	"ຮ້ານ: ດອກຄາຍທອງ"},
  {"restaurantNo": "CD-VTE-9533", "restaurantName":	"999 ຫຼ່ຽມໄຜ່"},
]
  
// -- end list restaurant name --

If the restaurantName of the shop is on the bill Not included in the list try again

If more than 50% of them look like a match, show the name of the restaurant that matches (name in the list)
restaurantName = ( one name match name in list restaurant name)

If the restaurantName of the shop is on the bill Not included in the list restaurant name Skip all steps. Return
{
    "error" : true,
    "message" : "RESTAURANT DO NOT MATCH",
    "restaurantName": string
}


total is total bill amount
If the bill does not have a total bill amount, set total = null

date is billing date
If the bill does not have a billing date, set date = null

orders is orders on the bill
If the bill does not have a orders on the bill, set orders = []
The order name must not be changed
The order name must be clear
The product amount some time refer as qty
if there are both qty and amount in the bill please set product amount base on qty
Languages in order name are Lao, English
Order names may contain line breaks.

If the order name looks like 50% up of some of the names below, setup match=true and nameMatch = ( one name match name in list)
productNo = productNo match
// -- start list --
var orderNames = [
  {"productNo":1,"productName":"Carlsberg"},
  {"productNo":1,"productName":"Carlsberg"},
  {"productNo":1,"productName":"Carlsberg"},
  {"productNo":1,"productName":"Carlsberg"},
  {"productNo":1,"productName":"Carlsberg 330ml(Bottle)"},
  {"productNo":1,"productName":"CARLSBERG"},
  {"productNo":1,"productName":"ເບຍຄາສເບີກ Carlsberg"},
  {"productNo":1,"productName":"Carlsberg"},
  {"productNo":1,"productName":"ຄາສເບີກ Carlsberg"},
  {"productNo":1,"productName":"ຄາສເບີກແກ້ວນ້ອຍ"},
  {"productNo":1,"productName":"ຄາສເບີກ ແກ້ວນ້ອຍ"},
  {"productNo":1,"productName":"ເບຍຄາສເບີກນ້ອຍ  #ແກ້ວ"},
  {"productNo":1,"productName":"Carlsberg Small Bottle"},
  {"productNo":1,"productName":"Beer Carlsberg"},
  {"productNo":1,"productName":"ຄາດສະເບີກແກ້ວນ້ອຍ"},
  {"productNo":1,"productName":"ຄລາສເບີກ(ນ້ອຍ)"},
  {"productNo":1,"productName":"Carlsberg small"},
  {"productNo":1,"productName":" Carlsberg B"},
  {"productNo":1,"productName":"ເບຍຄຣາສະເບີກ(ນ້ອຍ) - Carlsberg beer Bottle(330ml)"},
  {"productNo":1,"productName":"Carlsberg beer Bottle(330ml)"},
  {"productNo":1,"productName":"ເບຍຄາສສະເບີກ ແກ້ວ 330ml"},
  {"productNo":1,"productName":" CARLSBERG BOTTLE"},
  {"productNo":1,"productName":" Carlsberg"},
  {"productNo":1,"productName":" Carlsberg Small"},
  {"productNo":1,"productName":" Carlsberg"},
  {"productNo":1,"productName":"ເບຍຄາສເບີກ"},
  {"productNo":1,"productName":"ເບຍຄາສເບີກແກ້ວນ້ອຍ"},
  {"productNo":1,"productName":"ເບຍຄັສເບີກແກ້ວນ້ອຍ"},
  {"productNo":1,"productName":"ເບຍ Carlsberg"},
  {"productNo":1,"productName":"ເບຍຄາສເບີກ 4 ແຖມ 1"},
  {"productNo":1,"productName":"ຄາສເບີກແກ້ວນ້ອຍ"},
  {"productNo":1,"productName":"ເບຍຄາວສະເບີກນ້ອຍ"},
  {"productNo":1,"productName":"ເບຍຄາສເບີກແກ້ວນ້ອຍ"},
  {"productNo":1,"productName":"ສະເບີກນ້ອຍ"},
  {"productNo":1,"productName":"ເບຍຄັດສະເບີກ ນ້ອຍ"},
  {"productNo":1,"productName":"ເບຍຄາດສະເບີກແກ້ວນ້ອຍ"},
  {"productNo":1,"productName":"ເບຍຄາວສະເບີກແກ້ວນ້ອຍ"},
  {"productNo":1,"productName":"Carlsberg 330ml"},
  {"productNo":1,"productName":"ເບຍຄາສະເບີກ ແກ້ວນ້ອຍ"},
  {"productNo":1,"productName":"ເບຍຄາດສະເບີກ.ແກ້ວນ້ອຍ"},
  {"productNo":1,"productName":"ເບຍຄາສເບີກນ້ອຍ"},
  {"productNo":1,"productName":"ເບຍຄາສເບີກແກ້ວນ້ອຍ"},
  {"productNo":1,"productName":"ເບຍ ຄາສເບີກນ້ອຍ"},
  {"productNo":1,"productName":"ຄາດເບີກນ້ອຍ"},
  {"productNo":1,"productName":"ຄາດສະເບິກ"},
  {"productNo":1,"productName":"ຄາດສະເບິດ"},
  {"productNo":1,"productName":"ຄາສເບິກ"},

  {"productNo":2,"productName":"ເບຍຄາສເບີໃຫຍ່"},
  {"productNo":2,"productName":"Beer Carlsberg ໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກ Carlsberg"},
  {"productNo":2,"productName":"ເບຍຄາວສະເບີກໃຫຍ່"},
  {"productNo":2,"productName":"Carlsberg ໃຫຍ່"},
  {"productNo":2,"productName":"ຄາສເບີກໃຫຍ່"},
  {"productNo":2,"productName":"ຄາສເບີກ ແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ຄາດສະເບີກແກ້ວ"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກ(ໃຫຍ່)"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກ"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກແກ້ວ"},
  {"productNo":2,"productName":"Calberg"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກໃຫຍ່ #ແກ້ວ"},
  {"productNo":2,"productName":"Carlsberg"},
  {"productNo":2,"productName":"Carlsberg"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກ"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍ ຄາສະເບີກ"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກ L"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກ Carlsberg"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກ"},
  {"productNo":2,"productName":"ຄາສເບີກແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ຄາສະເບີກໃຫຍ່3ແຖມ1ໃຫຍ່"},
  {"productNo":2,"productName":"ຄາດສະເບີກໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກແກ້ວໃຫຍ່ 640 ມລ"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍຄັສເບີກ"},
  {"productNo":2,"productName":"ເບຍຄັສ"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກ"},
  {"productNo":2,"productName":"ເບຍຄາດສະເບີນ(ໃຫຍ່)"},
  {"productNo":2,"productName":"ເບຍຄັດສະເບີກ ໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍຄັສເບີກ(ແກ້ວ)"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກ ແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍຄັດສະເບີກ"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກ 640ml"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກ 660ml"},
  {"productNo":2,"productName":"ເບຍຄາຣສະເບີກແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍຄັດສະເບີກແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"Carlsberg  4 ແຖມ 1"},
  {"productNo":2,"productName":" Carlsberg 4 free 1"},
  {"productNo":2,"productName":"ເບຍ Carlsberg "},
  {"productNo":2,"productName":"ເບຍ Carlsberg "},
  {"productNo":2,"productName":"ເບຍຄຮັສະເບີກແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ໂປຣໂມຊັ່ນເບຍຄາສເບີກໃຫຍ່ 4 ແຖມ 1"},
  {"productNo":2,"productName":"ເບຍຄາວສະເບີກ"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກ"},
  {"productNo":2,"productName":"ສະເບີກໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍຄັດສະເບີກໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍຄາດສະເບີດແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"เบย Carlsberg "},
  {"productNo":2,"productName":"ຄາສເບີກ(ໃຫຍ່)"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກແກ້ວ ໃຫຍ່"},
  {"productNo":2,"productName":"Carlsbreg"},
  {"productNo":2,"productName":"ເບຍຄາວສະເບີກ ໃຫຍ່ Carlsberg 640"},
  {"productNo":2,"productName":"ເບຍຄາວສະເບີກ ໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍຄັດສະເບີກແກ້ວ Carlsberg"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍຄາວສະເບີກແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"Carlsberg 650ml"},
  {"productNo":2,"productName":"ເບຍຄາສະເບີກ ແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍແຄັດສະເບີກໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍ ຄາດສະເບີກແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍຄາດສະເບີກ(ແກ້ວໃຫຍ່)"},
  {"productNo":2,"productName":"ເບຍຄາດສະເບີກ.ແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍຄາສເບີກ ແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍ Carlsberg ແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍ ຄາສເບີກ ແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ເບຍຄາດສະເບີກ ແກ້ວໃຫຍ່"},
  {"productNo":2,"productName":"ຄາດສະເບີກໄຫ່ຍ"}

]
// -- end list --

After you receive this message, reply to this
{
    "status" : "ALL READY"
}

condition 2
Response in JSON format
{
  "isErorr": boolean,
  "message": string
}

if take time to detect more then 30 seconds up just set isErorr = true, message = "THE_BILL_IS_NOT_CLEAR" and then reponse as bad request to the frontend

if take time to detect less then 30 just skip the condition 2.
`;
const allReady = `{
    "status" : "ALL READY"
}`;

let messages = [
  { role: "system", content: "Bill detector" },
  { role: "user", content: promptText },
  { role: "assistant", content: allReady },
];

async function chatGPT(imageBase64) {
  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        ...messages,
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: imageBase64,
              },
            },
          ],
        },
      ],
      stream: true,
    });

    let response = "";
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      response += content;
    }

    const cleanJsonString = response
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const responseJson = JSON.parse(cleanJsonString);

    return responseJson;
  } catch (error) {
    console.log(error);
    console.log("error gpt");
    return { error: true, message: error.message };
  }
}

module.exports = chatGPT;
