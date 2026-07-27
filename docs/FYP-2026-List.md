Ragnarok - Multimodal File Manager
Ragnarok is a privacy-first, offline-capable desktop assistant designed to revolutionize how students and
researchers manage their academic knowledge. Built as a Multimodal Retrieval-Augmented Generation
(RAG) system, it allows users to search and interact with their entire local database-ranging from lecture
recordings and handwritten notes to research papers-using natural language.
• Multi modal Queries: Students can ask questions using text, upload an image of a complex diagram, or
provide an audio snippet from a lecture to find related materials.
• Academic Retrieval: Query regarding specific course content, transcriptions of recorded seminars, or
summaries of dense research papers.
• Cross-Modal Search: A student can search for a "graph of neural networks" (text) and retrieve the exact
timestamp in a video lecture or a specific PDF page where that graph appears.
• Offline Intelligence: All processing happens locally, ensuring that sensitive research data or personal
study notes never leave the device.
• Feedback Loop: If the local LLM provides an insufficient answer or fails to find a file, the user can flag
the query for the Admin View to improve the system's indexing or response logic.
Key Features
• Any-to-Any Retrieval: Seamlessly search across text, audio, image, and video modalities using a shared
vector space.
• Privacy-Preserving RAG: Leverages local LLMs (like LLAMA or LLAVA) to generate summaries and
answers without cloud dependency.
• Smart Ingestion: Automatically transcribes audio, extracts video keyframes, and OCRs images for full-
text searchability.
• Interactive Q&A: A native desktop interface (Electron/PyQt) that provides real-time Al-generated
explanations based on retrieved files.
• Actionable Organization: Tools to tag, cluster, and history-track academic files for better project
management.
Key Words
Multimodal RAG (Retrieval-Augmented Generation), Cross-Modal Embeddings (CLIP/lmageBind), Privacy-
First Al (Offline Inference), Local Vector Databases (Chroma/FAISS), Semantic Desktop Search
Multimodal R9tri9vo/-Augnu,1nt~d
Generation (RAG) Sys tern
t'ri~ pr-.~vmg, Dffll"-hrT-t M.rnont•(;'
•.arch acf'06• ony-to-any d-k.top mrK/io
Technology Used:
Python, CLIP, lmageBind, Whisper, ChromaDB,
PyQT
Supervisor Name:
Ms. Marium Hida
Group Members:
Fahd Ahmad {22i-1131)
•)!
Abeerah Aamir {22i-0758)
» •"· ca
cu.. -.-- - 11: -~. :;; ·-
a. + U-"'MA U.,.VA I , ~ .,... , .. : , : A : O. : _ : _ , , . ,,
$ - Ahmed Bin Asim (22i-0949)
-..CV "1-act o..r-o• - ._ (Vl•On,ol
FAST NUCES ISLAMABAD CAMPUS

ClimaCrop - Al-Powered Smart Agriculture Platform
ClimaCrop is an Al-powered agricultural platform designed to help Pakistani farmers adapt to
climate change through intelligent decision-making tools. The system integrates five core modules:
Al Crop Revenue Prediction using three ML models (Decision Tree, XGBoost, Random Forest) to
forecast revenue based on crop, variety, and temperature conditions; Fertilizer and Pest Control
Recommendations providing NPK composition analysis, fertilizer distribution, and pesticide
suggestions; Image-Based Disease Detection using EfficientNet-B0 CNN with HSV-based leaf
segmentation technique to classify 26 disease classes across 4 crops (Cotton, Maize, Rice, Wheat)
with 94-95% accuracy, followed by Disease Treatment Recommendations where the detected
disease information is sent to LLM to generate personalized, actionable treatment steps including
pesticide recommendations, preventive measures, and remediation strategies tailored to the
specific disease and crop type; Bilingual RAG Chatbot (Urdu/English) using Chroma DB and Gemini
API for context-aware assistance; and Advanced Analytics Dashboard with revenue trends, yield
comparisons, and interactive visualizations. The backend uses Python FastAPI with PostgreSQL 17 .8
data warehouse (star schema, ETL pipelines, CTGAN augmentation, 32+ features), while the
frontend is built with React 18, Bootstrap 5, supporting dark/light themes, bilingual interface with
RTL, and mobile-responsive design. The platform empowers farmers to predict revenue, optimize
resources, detect diseases, get treatment recommendations, and make data-driven decisions.
Features include:
• Al Crop Revenue Prediction using Decision Tree, XGBoost, and Random Forest models
• Fertilizer and Pest Control Recommendations with NPK composition and pesticide analysis
• Image-Based Disease Detection and Treatment Recommendations using LLM
• Bilingual RAG Chatbot (Urdu/English) with ChromaDB and Gemini API
• Advanced Analytics Dashboard with revenue trends and crop comparison tools
• PostgreSQL Data Warehouse with star schema, ETL pipelines, and CTGAN augmentation
• React Frontend with dark/light themes and bilingual interface (Urdu/English RTL)
• Real-time Al Inference through FastAPI with sub-2-second response time
Key Words: Al Agriculture, Revenue Prediction, Disease Detection, Fertilizer and Pest Control
Recommendations, RAG Chatbot.
CLl:'>1ACROP -1\1-
POWERED SMART
AGRICULTURE PLATFORM
OVERVIEW
AN Al POWtltCO CM"RT A::R CULT.JIU P'LAlrOQM roR l'AllCfANI
1#11tMEftS IT USES MACHINE L~UnlNO ANO t>Efr LOllt:NINO TfCHNIQUU
TO ANALYSE CROP IMAGES AND [t,,,VIRONMENTAL DATA. PREDICT
UVCNU,, onEC:r OtUASES AND OHIVU P[UONALIUD TIU,TMt.NT
ANO 'EltT LIUft UCOMMENDATIONS THROUGH A BILINGUAL RAO
CHATBOf
Technology Used:
Python, FastAPI, PostgreSQL, Ollama,
ChromaDB, API, PyTorch, OpenCV, React 18
TOOLS Supervisor Name:
@O +fll nu o
Ma'am Kainat Iqbal
TIMELINE Group Members:
Rafia Khan (22i-2054)
" D " A "' T A A fl C CO W L r L r E .C C l T U IO R N C OE A V l E M l O on D , E f L £ $ N r 2 5 0&.~ & ',J - G #H t/A O L l J C R O t': A U J8 I 0 T WT F E R G O R N A T T C 1 N 0 D 1 U, 6 2 Mahnoor Haider (22i-2026)
O!f't..O'YMOl1
I.\SIIIR SI\U·.l>l:?IH.Xi'i"O}, VI \IINOOR 11.\IDt-:R •2i!Mt02u: ,'\-..:0 RAfll\ Hashir Saeed {21i-0376)
~L:PER\'lSOR: \1S. K.-'\INAT IQBAL
FAST NUCES ISLAMABAD CAMPUS

ParhaiPartner: An Al-Powered Personalized Entry Test Preparation App
ParhaiPartner is an Al-powered web platform designed to help students prepare for university entry tests
through personalized learning and intelligent feedback. The system provides adaptive notes and quizzes, Al-
generated explanations, and performance analytics to help students identify weak areas and improve their
preparation.
The platform also includes a University Admission Management Portal where students can manage
university applications, track application status, upload admission documents with plagiarism checking, and
store admission records in one place.
There are two main views of the system - Student Portal and Mentor Portal. The Student Portal allows
students to attempt practice tests, view analytics, receive recommendations, and manage applications. The
Mentor Portal allows mentors to generate questions, validate notes, validate admission documents and
monitor student applications.
Features include:
• Al-powered personalized entry test preparation
• Adaptive notes and quizzes with explanations, analytics, and Doubt-Solving Chatbot
• University application management and tracking
• Admission document upload with plagiarism checking
Key Words: Artificial Intelligence, LLMs, RAG, Personalized Learning, University Applications Management
PARHAIPARTNER
Al ,-,~·c..-f l~rM.N--U~-.,1 lhA•..,•••e"" P,-c,-.-,l,u,u ,.t•.h·.,•.-..lll)'
,Wow.l,-.l,n.o,'\1••--•--•-=-••• S,! ..... ;. ..
u1.1•n.--.. ......
p--tMl. ..l iun n A n 1• n ~ • ll~ ~ l n @ N:" n u t
c1o ..........., 1. f.tM••'"• Nr.-111)
'l.~atk'lltk Jlo.t1•-~ [,dtM.'illlon Plulf'un"
Technology Used:
-:J=-
--- I -- _ ~ )
------- "':::::......-=~
Python, ReactJS, Django, PostgreSQL, LLM, RAG
-·T Architecture
-----
======-- ------
Supervisor Name:
Dr. Ali Zeeshan ljaz
Group Members:
Haleema Tahir Malik (i22 -0937)
dJ G p c, Muhammad Bilal Khawar (i22 -0786)
- - 6C:-- ..... MIIMA
Muhammad Mustafa Kamran (i22 - 1013)
FAST NUCES ISLAMABAD CAMPUS

VocalBot
Vocal Bot is an offline, self-learning voice-controlled home automation robot designed to prioritize
user privacy and local processing. Unlike commercial cloud-based assistants, VocalBot runs on a
local central server (Raspberry Pi) and understands natural language commands in both English and
Urdu. The system allows multiple household members to have customized profiles and controls loT
appliances securely within the home network. It also features an adaptive scheduler that learns
from user habits to provide intelligent reminders, alongside a bilingual mobile app for manual
control and remote monitoring.
Features include:
- Locally deployable Speech-to-Text (STT) and Natural Language Understanding (NLU) processing
for privacy-first operations in both English and Urdu.
- Direct control over smart home appliances (lights, fans, etc.) using edge hardware like ESP32
modules.
-Selective internet capabilities for weather, traffic, and news updates that only trigger with
explicit user permission
Key Words: Offline Voice Assistant, Home Automation, Bilingual NLP (Urdu/English), loT (ESP32/MQTT),
Edge Computing
Technology Used:
Python, OpenAI Whisper (TFLite) for STT, Rasa
N LU for Intent Extraction, Android SOK (Volley,
native TTS) for the mobile client
Supervisor Name:
Mr. Syed Muhammad Saad Salman (Internal) &
Mr. Kash if Yousaf (External)
Group Members:
Muhammad Rumman Qadir (i22 -1204)
Awais Ahmed (i22 -1225)
Ahmed Asif (i22 -1299)
FAST NUCES ISLAMABAD CAMPUS

Easylearn Al
Easylearn Al is designed for students who struggle with language barriers and fast-paced classroom
teaching. It is a bilingual Al-powered tutoring platform that provides Urdu and English explanations.
Students can upload lecture materials such as PDFs, slides, and audio files, and interact with the
system in natural language. The platform answers questions directly from uploaded documents to
ensure syllabus alignment. If an answer is unclear, students can request clarification or generate
practice questions from the same material.
Features include:
• Conversational question-answering grounded in uploaded lecture material using RAG.
• Bilingual explanations in Urdu and English with optional Urdu Text-to-Speech playback.
• Automatic quiz generation including MCQs, short-answer, and long-answer questions.
• Performance analytics dashboard to track progress, detect weak areas, and recommend
targeted revision.
• Secure user accounts with document management, history tracking, and personalized
learning preferences.
Key Words: Retrieval-Augmented Generation (RAG), Bilingual Learning, Personalized Tutoring, Urdu
NLP, Adaptive Assessment.
..
... ...
Ml. ......- ..,he~ c: s cr .a s c .o t. .G.e.l.. .... .. .... .... . .., . ,..
Or. . U:sn'\an .,._...( RESOLVE)
:F.at't\an ~ tz2t,-.1200J
Mama::• a.-Afaz (221-~
....-1 .A,h.-n,ad Dua: (22.1•2385)
EASVLEARNAI
An fn~n.'1: Vrdw....C"'9lb-h Tutoo,1'ng ~m, -wfth
MU~'I'. ~rauon end A.CJe,pU-,,,W AAO
The P roblem ~
• C:urrs•nt t:ool• or• t.,axt-only. Ignoring 't.h,• ecc..,.tbltrcy
o• toc:-aa ¥olice ln·~ion..
• Tradtt.lion.a.J Platt~ off•r rlgi.CI., non-~rve
c.onte·nt th.•~ l9n~ 1ndivld:uat g:apa..
• St.ud.ents ...t y on ~tile Po-=-ell"lld aUd_.. -.1r1..h z•'f"O
lnt.eraC'Uon or t'eectbaek.. m
Our ln no-vation
Technology Used:
• M.utti--..,,• .,... O,,e~"'t.So-n
• Adapt....,_ AA.Ci F~rk FastAPI, ChromaDB, Groq API, PyTorch,
• c ..., Ph, a· .-sont--c,,
Transformers, SciPy / NumPy, React,
Work:flow
- - --
Typescript
Supervisor Name:
Mr. Saad Salman, Dr. Usman Qayyum (Ext)
Group Members:
Hamza Bin Riaz (i22 -1165)
Technologies Used @ Ali Ahmad Butt (i22 - 2385)
0
~ LengChe1n
Farhan Ahmed (i22 -1200)
O PyTorch
FAST NUCES ISLAMABAD CAMPUS

CRYPGEN (Al-Assisted Adaptive Chaotic-DNA Encryption for Scalable
Cloud Storage Security)
This project presents an Al-based secure cloud storage system that adapts encryption and compression
techniques according to data sensitivity. The system uses three-layer authentication (User ID, Password,
OTP) for secure access. Uploaded files are hashed, fragmented, and analyzed by an Al model to classify
sensitivity levels. Based on classification, adaptive Deflate compression and Chaotic-DNA encryption are
applied before storing data in the cloud. The system ensures enhanced security, optimized storage, and
efficient file retrieval.
Features include:
• Authentication (User ID, Password, OTP)
• SHA-512/256 hashing with file fragmentation
• Al-based sensitivity classification
• Adaptive compression and Chaotic-DNA encryption
• Cloud storage integration with deduplication
• Secure file reconstruction with integrity verification
• File reconstruction with integrity validation
Key Words:
Artificial lntelligence,DNA Chaotic Encryption, Cloud Security, Data Sensitivity Classification ,Secure File
Storage
______ _
b • .. •
•Traditlonalcryptographic methods have vulnerabilities.
•Cyberthreatsare growing incomplex1ty.
•Secure,dynamlc keygeneratlon Is essential.
•Al-based systemto classify data sensitivity automatlcally.
•Adaptivo ONA-basod chaotic oncryption
•Enablesecurecloud storage and controlled decryption.
Technology Used:
React.js, Node.js,python, Zlib,PostgreSQL
VS code, AWS S3,email.js,google colab
TIME-LINE
Supervisor Name:
-- . Dr.Hina Ayaz
'"'•"-· I_1•:. -.,=..,......-.,., ._-...
An..ai,,al• Group Members:
Wajiha Adnan (i22 -1263)
••
Eman Shakeel (i22 -1279)
lffah Naveed (i22 -0974)
FAST NUCES ISLAMABAD CAMPUS

QuickAid
Quick Aid is an Al-driven disaster management platform developed to support victims, volunteers, NGOs, and
administrators during emergencies such as floods, earthquakes, and fires. The system works as a centralized
coordination hub that allows victims to submit help requests and track their status in real time. It provides two primary
perspectives - User View (Victims and Volunteers) and Admin/NGO View - ensuring structured coordination and
efficient relief management. The platform uses Artificial Intelligence to prioritize urgent cases, assist in missing-person
recognition, and optimize resource allocation. In situations where cellular networks are unavailable, QuickAid enables
offline communication through Bluetooth mesh networking, allowing peer-to-peer message relay in disaster-affected
areas.
Features include:
• Real-time help request submission and tracking system
• Live coordination through built-in chat and interactive maps
• Al-based prioritization of emergency requests
• Missing-person detection using image recognition
• Role-based dashboards for Victims, Volunteers, NGOs, and Admins
• Offline Bluetooth mesh networking for communication without internet
• Resource and volunteer management tools for NGOs
Key Words: Al-Driven Disaster Management, Bluetooth Mesh Networking, Real-Time Coordination, Resource
Optimization, Image Recognition
Technology Used:
Katlin, Firebase, Android Studio, MESH
Networking, Computer Vision
Supervisor Name:
Mr. Saad Salman
Group Members:
Faisal Jabbar (i22-1183}
Sara Jabeen (i21-0623)
Saba Riaz (i21 - 0624)
FAST NUCES ISLAMABAD CAMPUS

NextShot
NextShot is an Al-based cricket batting analysis mobile application designed to enhance player
performance through intelligent video analysis. The system processes side-view batting videos
using a trained YOLO-based deep learning model to extract body keypoints and track ball trajectory.
It evaluates posture, head stability, weight balance, and shot execution to generate structured
performance feedback.
The application is developed in Katlin and integrates Firebase for authentication, data storage, and
progress tracking. It allows users to record or upload videos, receive Al-generated feedback, view
performance history, and interact with a built-in chatbot for guidance. Based on ball trajectory and
body positioning, the system can also suggest whether and which more suitable shot could have
been played.
Features include
• Video recording and frame extraction
• pose estimation, shot classification and recommendation
• Al-based feedback generation and chatbot assistance
• cloud-based progress storage.
Eli
lmprovln& cttck« jMffOrrnanc• usln&lntttUpnt vtcteo ptOCeuiAJ and AJ•powtM fHdi.K.t.
q;;;; ___
____ _
·------- ...----
..,,..._ -......,.
_ _ _ _
___ _
-,......-. .,,,_-_.....,-#
..
/
Mi
Technology Used:
·.
.-~ - ,
-...
·
...
- _,
-
,,. -
·
..
-
_, · . -
-
Katlin, Firebase, OpenCV, Flask, YOLO, GitHub,
RoboFlow, Visual Studio
Supervisor Name:
__
··----··-- ·-
·---,.-..,-.."' ·--- Mr. Muhammad Saad Salman
id M Group Members:
K.Kotlin an s d tu r d o i id o . M A. . c;f.ut or,encv ~ ask Ayesha Muqadas (i22 -1153)
(jGltHub rJ @roboflow Nimra Aslam (i22 - 1164)
Muhammad Ali (i22 - 0996)
FAST NUCES ISLAMABAD CAMPUS

FORESYTE
ForeSyte app is being made, whilst keeping the perspective of examination authorities and
academic personals. There are two views of this app - Investigator View and Admin View - the
former is for the investigators to use the features provided by the system to monitor examination
halls through CCTV/camera feeds and to review detected suspicious activities of students and
invigilators in real time and from recorded footage. The system analyzes video streams to identify
actions such as phone usage, irregular gestures, frequent head movement, and prolonged
invigilator absence, and logs them with timestamps, seat numbers, and room identifiers. If in any
case the system flags an activity incorrectly, the investigator can review the evidence and validate
or dismiss the violation using the dashboard. The latter is for the admin, who will manage user
roles, exam sessions, and system configurations, and will update detection parameters and reports
in case of any incorrect or missing system outputs.
Features include:
-Al-based monitoring of student behavior including phone usage and irregular gestures.
- Invigilator activity monitoring to detect negligence or prolonged absence.
-Ad min dashboard for viewing, validating, and exporting reports (PDF/Excel).
- Real-time and recorded exam footage processing with automated violation report generation
-Secure role-based access for administrators and investigators.
Key Words: Artificial Intelligence, Computer Vision, Exam Surveillance, Cheating Detection, Video Analytics
Fi5re
Al Powered Exam Monitoring system
ro mar.tor exams and ensLre academic integrity using advanced Computer V1s1on
ARCHITECTURE
2:1 ~ -
UVE/REC~J[D
"10[0
TIMELINE
Video S&tup. Raport Technology Used:
C(l!Tl'l!ru
rx-..r.11mtmtntinn. intc;,grotion
Python, OpenCV, PyTorch, TensorFlow, YOLO,
FastAPI, React.js, MongoDB, PostgreSQL,
Ka le, Roboflow
lrolnlr\Q&
Student 1ntegroton
Dasrtbcard Ms. Saira Qamar
TOOLS TEAM MEMBERS Grou Members:
221-0857 1nam ullon Shalkn
lnam Ullah Shaikh (i22 -0857)
22i-)869 Em:,an Fatima
22i-1313 Ad&n Siol
Emaan Fatima (i22 -0869)
SIJPFRVJSClA:
Ms.. Soi1c:i Qarnur
Aden Sia I (i22 -1313)
FAST NUCES ISLAMABAD CAMPUS

VisionAid
VisionAid is a mobile and wearable assistive system designed specifically to support visually
impaired individuals in achieving safer and more independent outdoor mobility. The system
focuses on detecting outdoor obstacles within a range of Oto 10 meters and provides real-time
audio alerts to help users avoid potential hazards while moving through streets, campuses, parks,
and other open environments. VisionAid operates through a dedicated mobile application, which
serves as the central platform of the system. Users can either connect glasses with a mounted
camera to the application or use their mobile phone camera directly, depending on their
preference and convenience. The application's user interface is carefully designed for the visually
impaired community, enabling interaction through simple touch and swipe gestures, while all
guidance and notifications are delivered through clear audio instructions in both Urdu and English.
The system is designed to function without requiring internet connectivity, ensuring reliable
assistance even in areas with limited or no network access. Developed with affordability,
accessibility, and local usability in mind, VisionAid supports users in carrying out everyday outdoor
movement with greater confidence, awareness, and independence.
Key Words: Edge Al, Computer Vision, On-Device Inference, Assistive Al, Monocular Depth Estimation
VisionAid
To assist visually impaired individuals in achieving safer mobility
through obstacle detection and distance awareness.
ARCHITECTURE
Technolo Used:
TIM ELI NE
Visual Studio Code, Android Studio, Arduino
Models Selection
Assistance Module IDE Flutter ONNX Runtime TFlite
Supervisor Name:
SEPT -OCT NOV-DEC FEB-MARCH APRIL-MAY
Dr. lmran Ashraf
lQQlS. TEAM MEMBERS Grou Members:
1222348 Maha Qalser Maha Qaiser (i22 - 2348)
1221142 Amna Amir
1220542 Hafsa Siddiqua Syeda Amna Amir (i22 - 1142)
ll~
Dr. Im ran Ashraf Hafsa Siddiqua (i22 -0542)
FAST NUCES ISLAMABAD CAMPUS

Professional AR Simulator
Professional AR simulator is a platform which is mainly built for trainees and training administration to
perform their day-to-day objectives. There are two views of this game, Trainee View and Admin View,
the former is for the trainees to use the features provided by our game to interact with an Al-powered
Augmented Reality (AR) simulation for professional training, perform realistic profession-based tasks,
receive intelligent navigation guidance, real-time feedback, and situational awareness support within
real-world environments, in natural language i.e. English. Trainee if in any case feels that the system
generated task or guidance is unclear or incorrect, trainee can send his/her query to ad min using the
feedback button present at the screen. The latter is for the admin, who will update the task dataset,
refine Al guidance, and improve system responses in case offailure of an answer by the system.
Features include:
• Training related modules including profession policies, module information, instructor related
information and skill policies.
• Realtime task generation from neural networks
• Navigation related queries including real-time movement guidance and room spatial status
• Sending query to admin panel in case of failure of guidance.
• Dataset updated after admin reviews the query.
Team Members:
AqN Melik 22i 1147
Sowob All bar 21i-11511
Fcrlimo 2:li-10"4
An Al-powered AR simutction gcune that delivers immcnivc
profeuional training directly through srnartphones, It eliminate,
the n..d for ex.,-nsh•• VR. ho,-d,,,,,or•, md(.ing ockipti.... skill
development h09hly ~«euible and Kalable.
,:.- Technology Used:
I <it-i,s \ fl
l-- ~ -...,...-.,,- ... -,~.... ,.
,.. • Ol ,. ~-=-· C#, Unit , Blender,Fi ma, AR Foundation
----,---~
Supervisor Name:
Ma'am Rabail Zahid
Grou Members:
Aqsa Malik (22i - 1147)
Sawab Akbar (22i-1158)
Fatima (22i-1074)
TechnolOGiH ·~
$ -70
c, Unty ctcndcr Monso OJ (A1 A < k :r C c < id H A 't "I 4-R four<:otlon
FAST NUCES ISLAMABAD CAMPUS

VocaBite - Multilingual Voice-First Food Ordering System
VocaBite is an Al-powered multilingual {Urdu & English) voice-first food ordering web application
designed for the Pakistani market. The system enhances traditional food ordering by introducing a
conversational voice bot while still supporting manual text-based ordering.
The project addresses common issues in phone-based ordering such as miscommunication, accent
variation, and order errors. It improves accessibility for Urdu-speaking, elderly, and visually
impaired users, and reduces restaurant workload during peak hours.
The system includes:
User View:
Users can discover restaurants, browse menus, and place orders either manually or through the
voice assistant. The voice bot understands natural Urdu and English speech, extracts food items
and quantities using NLP techniques, and confirms the order before placement.
Restaurant/Admin View:
Restaurants can manage menus, receive and track orders, and access a dashboard for order
handling and basic analytics.
Key Words:
Voice-First System, Multilingual NLP, Speech Recognition, Conversational Al, Food Ordering Automation
Key Features
Multilingual Voice Bot (Urdu & English),
Manual Text-Based Ordering, Al-Based Order
Extraction, Location-Based Restaurant Discovery,
User Profiles & Order History.
Technolo Used:
React.js, Node.js, Express.js, PostgreSQL, Python
NLP, S eech-to-Text, Text-to-5 eech, Docker, Git
Dr. Mehreen Alam
Grou Members:
Nauman Nawaz (i22 - 0752)
Muzzamil Hissan (i22 -0881)
Saad Awais (i22 -1303)
FAST NUCES ISLAMABAD CAMPUS

FinAI - Al-Powered Financial Platform
FinAI is a comprehensive web-based platform that leverages artificial intelligence to bridge the gap between complex
financial services and everyday Pakistani consumers. The system addresses three critical barriers in financial inclusion:
complex documentation, uncertain eligibility, and limited financial guidance.
The platform provides an intelligent solution for individuals seeking financial products such as loans, credit cards, and
investment options from Pakistani banks. Through advanced Natural Language Processing (NLP) and Machine
Learning algorithms, FinAI simplifies complex financial documents, provides real-time eligibility assessments, and
offers personalized financial advisory through an Al-powered chatbot.
Users can upload financial documents in multiple formats (PDF, Word, HTML) and receive simplified versions adjusted
to their comprehension level. The eligibility assessment module uses ML classification models to predict approval
likelihood based on user financial profiles, considering factors like income, employment status, credit history, and
debt-to-income ratio. The conversational Al chatbot provides personalized recommendations, answers financial
literacy questions, and guides users through financial decisions.
Features include:
-Document Intelligence: Automated simplification of complex financial documents from multiple Pakistani banks with
NLP-based text extraction and analysis. Users can select complexity levels (Basic, Intermediate, Advanced) and receive
plain language explanations with adjustable readability scores.
-Financial Qualification Assessment: Real-time eligibility scoring for loans, credit cards, and investment products
using ML classification models. The system provides instant qualification results and identifies positive and negative
factors.
-Al Financial Advisory Chatbot: Intelligent conversational Al for personalized financial recommendations. Features
include intent detection, entity extraction, context-aware responses, and multi-turn conversation capabilities.
-User Profile Management: Secure user authentication with JWT tokens and comprehensive financial profile creation.
-Dashboard and Analytics: Personalized user dashboard displaying eligibility scores, financial insights, activity history,
and recommended actions with data visualization.
Keywords: Artificial Intelligence, Natural Language Processing, Machine Learning, Financial Technology (FinTech),
Document Intelligence
e~
finid Supervisor
M,. saad satman
Team Members (~<-il-l~ i
• Anu Bin Ruhtd 221--0907
• HUMln Akhta, 221--1241
Al Powered Financial Advisor • Amna Tahir 221--HB~ ---.....
SlmpUfying Financial Services
Overview
FinAI is an Al-powered neb platform designed lo brtdge the gap beh'o'etn comp~•
fln.a.nclal servke and e\leryday usen In Pakistan with ttM following re.uurH:
• Document Slmpllflcalion (comple• bank usy-c.o-unde,stand l.ainguage)
• Lo.an & Credit EllglbUlty Checking (input sutlstks - ellglbilltydet.alls) Technology Used:
• Ptrson,ilhtd Flnflnd"I Advkt via Al AdY!sory ChftbOl
• Multi-l!ank CO¥erage and Se-cure Profile and 0Mhboard M.inagement React.js, Node.js, Express.js, Python,
MongoDB, HTML, CSS, PyTorch, Scikit-Learn,
Pandas, NumPy, Transformers, JWT, Trello,
GitHub, Docker, AWS
Timeline
....
+ +-- Supervisor Name:
Phase 1 Phase 2 Phase 3 Phase 4
Al.llh.enflcetlcl\llsN ~t.ModelT.-.lnlr\g, 1,1---.f-•IUV,C rlMITeltl"I, Mr. Syed Muhammad Saad Salman
Pro~. D<st• GolKtlol\ Doeu....,nl $1,nplifl(;_.tl(,n, - • b-.,•t>o", hl•,a,_,,o.., lmepatio11.
Ul,Frontend, Tnt9\I lrwegrsdon. luting h~...,NJ.otl'•c'IMto,11- l)e,plovm,ent
Group Members:
Anas Bin Rashid (i22 - 0907)
Muhammad Hasnain Akhtar (i22 - 1241)
Amna Tahir (i22 - 9885)
FAST NUCES ISLAMABAD CAMPUS

| MEDLOCK - |     | Decentralized Medical Health Records  |     |     |     |
| --------- | --- | ------------------------------------- | --- | --- | --- |
Medlock is a blockchain-based decentralized application (dApp) designed to securely store and manage
medical health records, keeping the perspective of patients, doctors, and other healthcare stakeholders in
mind. There are multiple tailored views in this application: Patient View, Doctor/Lab View, Hospital View,
Insurance View, and  Researcher View. The primary view is  for the patients, allowing them to use the
features provided by the app to manage their health records, grant temporary role-based access to medical
professionals, and initiate insurance claims. The other views allow authorized entities to append session
notes, manage hospital billing, verify insurance claims, and query anonymized datasets. The system utilizes
a hybrid approach, separating heavy, AES-256-encrypted medical files onto off-chain IPFS storage, while
access rules and immutable audit trails are governed by smart contracts on the Quorum blockchain.
FEATURES
•  Strict access control through smart contracts that enforce patient-managed permissions.
•  Immutability, generating a permanent, non-repudiable audit trail for every data interaction.
•  Advanced privacy through AES-256 encryption for heavy medical files securely stored off-chain.
•  Role-based dashboard interfaces tailored for Patients, Doctors, Hospitals, Labs, Insurers, and
Researchers.
•  Provision of fully anonymized health records for medical and academic research.
Key Words: Blockchain, Decentralized Application (DApp), Electronic Health Records (EHR), Data Privacy,
Decentralized Storage
MEDLOCK
MEDLOCK
| MOTIVATION                                                                                                                       |                                                   | CORE FEATURES  |     |     |     |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------- | --- | --- | --- |
| vutne-rable to bn1aches.  ll'ad tlonal health ~Ol'ds are fragmMt~ and htghl)' •· Access C0ntrol: Smart contracts enforce stnct,  | ~tlent-man&9ed permissions                        |                |     |     |     |
| •;,,, PaLenu IKk ownership Md control over th(!lr                                                                                | rmmutab• 1ty: Every data mteract1on gcner;,tcs a  |                |     |     |     |
| personal medical data                                                                                                            | permanent a-.ictlt trail.                         |                |     |     |     |
Pril1acy. Heavy medical flies are securely encrypted
and stored off-chain.
SYSTEM ARCHITECTURE
Technology Used:
Quorum, IPFS, Node.js, React, Docker, GitHub
Supervisor Name:
| .-::::•::·•-::-. *~•. ..  |     |     |     | Ms. Maryam Hida  |     |
| ------------------------- | --- | --- | --- | ---------------- | --- |
Group Members:
TOOLS AND TECHNOLOGIES
|     |     |     |     | Muhammad Ra hat Shafi  | (22i - 1061)  |
| --- | --- | --- | --- | ---------------------- | ------------- |
SupflJrvlsor:
|                | 0             |                               | t-4< ; M a< \l.! oml,6 .(I,  |                       |              |
| -------------- | ------------- | ----------------------------- | ---------------------------- | --------------------- | ------------ |
|                |               | .. _.__,.I:im                 | N   • ~ ~ ;                  |                       |              |
|                |               | - .. ... ...  0 - ,~.,.,....  | 2 1 . . 0 1 7 5              | Muhammad Daud Cheema  | (22i -0875)  |
| ·;;..,.;,:· "  | dockerGitHub  | -~K ~ A l '(I                 | H l - 1 0 1 2                |                       |              |
Mudassar Khalid  (22i - 1072)

FAST NUCES ISLAMABAD CAMPUS

INDA-lntelligent Network Design Automator
INDA is an Automated Network Topology Generation and Deployment System designed to simplify
the creation and deployment of virtual network infrastructures in GNS3. The system enables users
to  generate  complete  network  topologies  using  multiple  input  methods  and  deploy them
automatically, reducing manual configuration while ensuring accuracy and efficiency.The workflow
includes three phases. In the Initiation Phase, users connect by providing an IP address and port.
In the Input Selection Phase, users choose one of three input types: importFile, description, or
architecture. The  importFile option supports structured files (.vsdx, .xml, .svg). The description
option  processes  natural-language  prompts  using  a RAG  approach with Ollama  Mistral. The
architecture  option allows GUI-based architectural input for building-level network topologies.
Features include:
- Imports diagrams, extracts devices and connections, generates YAML, and deploys via Ansible.
-Convert prompts into Machines and Connections datasets, generates YAML, and maps it to GNS3.
-Converts GUI architectures into floor-wise topology, generates YAML, and deploys via Ansible.
-Desktop interface to import inputs, display YAML and error reports and launch deployments
Key Words: Network Automation, RAG-LLM, GNS3 REST API, YAML Topology Generation, Ansible
INDA
| ~                                     |     |     | '\,~,..,  )  |     |
| ------------------------------------- | --- | --- | ------------ | --- |
| Intelligent Network Design Automator  |     |     | -            |     |
Cnnv,ut u~r input tn:. fully r:nnfigur.:1nh~ ::1nri tPst::1hlP topology on CNS3
System Architecture
|     | Topology Description  | Architecture Input  |     |     |
| --- | --------------------- | ------------------- | --- | --- |
-~~-
..... ~,.~_,,_....,.
f.o<I, •-• I, -•~<I•~ IJ ! ,-·~
Technolo  Used:
|     | Fully Configurable & Testable  |     | ,,w,,,  |     |
| --- | ------------------------------ | --- | ------- | --- |
Topology
Python, GNS3, RAG, LLM,Ansible,
Visual Studio
Supervisor Name:
| AUQ-sep                   | OCt-NO'J  | Jan-Feb       |     | Dr. SubhanUllah  |
| ------------------------- | --------- | ------------- | --- | ---------------- |
| Tools and JechnolIo~g !u  |           | Team Members  |     |                  |
Grou  Members:
e  I( fJ), ..
|     |         | i2 . 2 0 8              | 0 9  ~ i 2 :a   W a j id    |     |
| --- | ------- | ----------------------- | --------------------------- | --- |
|     | python  |                         | Athaar Naqvi (i221166)      |     |
|     |         | 12 2 1 1 6 6            |  A t h i 'H t r  N a q v i  |     |
| 6   | -       | i2213U8 Ambreen Arshad  |                             |     |
S u p e r v i s o r :  D r .  S u b h a n  U l li lh   Ambreen Arshad (i221308)
|     | ..  It]  | Co -s u p e r v i s o | r :  D r , O a n is h  S h e h za d  |     |
| --- | -------- | --------------------- | ------------------------------------ | --- |
Fiza Wajid (i220809)

FAST NUCES ISLAMABAD CAMPUS

Academic Chatbot
The current FIR registration process suffers severe challenges that do not allow people to access
justice in a timely manner and in a fair way. There is usually a delay, denial, or control in filing Fl Rs
by citizens, making the law enforcement less trusted by society. Case tracking becomes hard as
manual and paper-based systems are vulnerable to inefficiency and errors, not to mention the fact
that they can also lose records. Even online portals (which are utilized in certain areas) are still
based on the human touch, and the possibility of prejudice and corruption remains. The citizens do
not have much visibility as to the state of their complaints, and this frustrates them to an extent
that  many  are  not  keen  to  report  crimes.  Such  absence  of transparency  also  touches  on
accountability whereby there is no sure indication that FIRs will not be tampered with after being
submitted. Moreover, remote or rural populations have accessibility issues, as they may be left with
no choice but to visit the police station physically. Nor is there yet some commonized means of
transforming unstructured inputs given by citizens, be it in the form of narration or via voice
messages, into valid FIRs. All these problems result in a gap in justice whereby crimes are  not
reported or unresolved. To solve these issues, the proposed Automated FIR System based on a
blockchain aims to offer a safe and immutable and transparent platform of FIR registration. Using
blockchain, records can be viewed as being immutable and able to be audited in full, which gives
citizens and law enforcement trust in each other. The Al that has been integrated also makes this
easier by directing users on how to write correct FIRs using a text or audio input. This system will
help to eradicate corruption, minimize delays and build back the confidence of the people in the
FIR process through automation, transparency and accessibility Features include:
- Citizens can interact with Al chatbot for queries related to FIR.
- Officer Assignment by ADmin to FIR
- Officers or Admin can approve or reject the FIR.
- Checking if FIR is legit or Fraud.
- Blockchain Storage of FIR
- Citizens will get Notifications as their FIR proceeds.
- Citizens can track FIR
| - Search and Retrieval of Fl Rs  |     |     |     | e   |     |     |     |     |     |
| -------------------------------- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
FIRLedger
| OBJECTIVE  |     |     | Superviaed By:Mr  |     | Salman  |     |     |     |     |
| ---------- | --- | --- | ----------------- | --- | ------- | --- | --- | --- | --- |
Co Supervised By:Ma Sana
| a i' Tl                                                    | s   to  d                                 | de n t                      |       | A.urengxaib                |     |     |     |     |     |
| ---------------------------------------------------------- | ----------------------------------------- | --------------------------- | ----- | -------------------------- | --- | --- | --- | --- | --- |
| F I R L Y d g t! f                                         | e v u lo p   I I s e c 1 . . n            |   u n d  e f f   "N t tb·   |       | Group Members              |     |     |     |     |     |
| b o 9 e d  s y ! l t e m                                   |   f o r o u t o m o t i n 9  t h e   f il | i n g  a n d   m o no g e m | e nt  |                            |     |     |     |     |     |
| of Fl?9. The pro,ect streomhneg comploiit rogigtration     |                                           |                             |       | Avesh a SiddiQeo i21-2479  |     |     |     |     |     |
| ver1f1cat1on, and approval processes wh le ensunng         |                                           |                             |       | Nid8Azami21-0433           |     |     |     |     |     |
| lfensp~ra,-cy.dota mt0grity.a'"ld accountabil l'f through  |                                           |                             |       | Muneeb ul Islam i22-1209   |     |     |     |     |     |
rola•basQd accei;:g ::and re.iil•timQ monitoring.
Architecture
Technology Used:
| AA            | •  "            |     |     |     |               | Blockchain, Python, React,, Visual Studio  |     |                   |     |
| ------------- | --------------- | --- | --- | --- | ------------- | ------------------------------------------ | --- | ----------------- | --- |
| ~C(\          | ,-::it.  I      |     |     | r   |               |                                            |     |                   |     |
| User          | FIR Submission  | T   | r   |     |               |                                            |     | Supervisor Name:  |     |
| Registration  |                 |     |     |     | Notification  |                                            |     |                   |     |
r
|     | @   |     |     |     |     |     |     | M.Sadd Salmam  |     |
| --- | --- | --- | --- | --- | --- | --- | --- | -------------- | --- |
Tracking
Data Storago
|           | Deploy on Web  |     |                     |     |     |     |     | Group Members:         |     |
| --------- | -------------- | --- | ------------------- | --- | --- | --- | --- | ---------------------- | --- |
| Timeline  |                |     | Tools & Technology  |     |     |     |     | Nida Azam (i21 -0433)  |     |
ChatBot
| lot!Maclui&rlR  | ,.,otiheotkin&         |     |     |     |     |     |                      |     |        |
| --------------- | ---------------------- | --- | --- | --- | --- | --- | -------------------- | --- | ------ |
|                 | Mult,lono.iaoeSLQ)Ott  |     |     |     |     |     | Ayesha Siddiqa (i21- |     | 2479)  |
St.bm9910f"
| 1   | 2   | 4   |     |     |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
ffl>
|     |     |     | 0   |     | Fi  |     | Muneeb ul lslam(i22 - |     | 1289)  |
| --- | --- | --- | --- | --- | --- | --- | --------------------- | --- | ------ |
Bloekeho1n 6t0f'Ct&'9 &
Evidence Upload

FAST NUCES ISLAMABAD CAMPUS

|     | ScrumMate - |     | Al Scrum Master Assistant  |     |
| --- | ----------- | --- | -------------------------- | --- |
ScrumMate is an Al-driven multi-agent Scrum Master system designed to transform team meetings
into actionable project outcomes. It captures live or recorded discussions, transcribes speech with
speaker identification, and automatically extracts decisions, action items, and user stories. The
system then updates product backlogs and sprint boards while maintaining a searchable memory
of past meetings. By combining real-time transcription, local LLM reasoning, vector memory, and
workflow automation, ScrumMate reduces  manual project management effort, improves team
coordination, and  helps track progress,  blockers, and  responsibilities efficiently. ScrumMates'
features include:
- Real-time meeting transcription with speaker diarization
- Automatic extraction of MoM, action items, and user stories
- Sprint planning support with smart task assignment
- Stand-up summaries and blocker detection
- Integration with tools like Jira, GitHub, and Trello
- Semantic search over past meeting records
Key Words: meeting intelligence, real-time transcription, RAG/vector search, multi-agent Al, backlog
automation
PScrumMate.
Automating Agile worktlows usu,g Multi-Agent Al & Re&l-r.,.. Meeting lntelltgence.
pipeline
| rreeting agent  | planning agent  |       | monitoring agent  |     |
| --------------- | --------------- | ----- | ----------------- | --- |
| - ;W1           |                 | --I~  |                   |     |
j
| A   |     |     | tllOC.:.l,. ,~.llll  |     |
| --- | --- | --- | -------------------- | --- |
-7·-
| r   | .&i.  | A   |     |     |
| --- | ----- | --- | --- | --- |
.&
|     | J,·- |     |     | Technology Used:  |
| --- | ---- | --- | --- | ----------------- |
Whisper, Ollama, LangChain, n8n, React,
| I   | i~i  | -   |     |     |
| --- | ---- | --- | --- | --- |
FastAPI, PostgreSQL
,j,
= -i~ii
|     | lii~----- |     | ,.  | Supervisor Name:  |
| --- | --------- | --- | --- | ----------------- |
llf-----~
Ms. Marium Hida
·• _~_ ... .,..,...,........... .-.:1.1..1..- "Mlp
-..
Group Members:
| Tools  |     | Team Members  |     |     |
| ------ | --- | ------------- | --- | --- |
Ayaan Mughal (22i-0861)
Ms. Marrium Hida -Supervisor
Muaz Ahmed -i221125
Mishal Ali (22i-1291)
Ayaan Mughal-i220861
|     |     | MishalAli  | i221291  |     |
| --- | --- | ---------- | -------- | --- |
Muaz Ahmed (22i-1125)

FAST NUCES ISLAMABAD CAMPUS

Syntest Al
Syntest is an Al-powered API testing and monitoring platform that automates quality assurance through
five core modules. The system is designed to handle the entire API lifecycle, from initial specification
analysis to continuous monitoring.
Core Features & Functional Modules:
• Intelligent Test Generation: Automatically parses any API Spec. It uses Al to generate positive, negative,
and edge-case test scenarios, including boundary value analysis.
• Comprehensive Functional Testing: Validates business logic, CRUD operations. It features an automated
Data Provider Layer that manages the lifecycle of dynamic test entities like tokens and user IDs.
• Advanced Security Assessment: Conducts automated scans based on OWASP API Security Top 10,
identifying vulnerabilities such as BOLA, SQL injection, and unauthorized access.
• Performance & Load Testing: Executes diverse testing modes; including spike, ramp-up, soak, and stress
testing, to detect bottlenecks.
• Continuous API Monitoring: Performs active synthetic testing at configurable intervals and passive log
analysis to track real-time uptime, detect anomalies, and trigger alerts.
• Al Chatbot Assistant: Provides a natural language interface to trigger platform functions, such as starting
security scans, comparing historical results, or troubleshooting failed tests.
Keywords: Agentic Al, Al-Driven Test Automation, OWASP Security Scanning, API Monitoring, Functionality Testing
An Jlil-powerec API testingpatform that autom.eti::att,-gene-ates,ei<t!CJte,;, and arr.a y!es
funcbon.:il. !.«l.mty, ,c1nd ~rfor-M:u·« tet~ to cn:.un.-rclioblc, ~:;urc, :ind hi9h-per'ormin9 .O.Pt~
Technology Used:
FastAPI, NodeJS, NextJS, PostgreSQL,
MongoDB, Redis, Docker, n8n
Su ervisor Name:
Mr. Usama lmtiaz
Group Members:
Ayesha Shahid (i22 - 2483)
lOOLS l TECHNOLO-Jl£5 FYPSUpon·l,or-; C:,-~upervl1or:
Mr. Llsama tntlaz Ur. Hoson Mllitobo Zirwah Khalil (i22 - 0748)
0 . "c~· .!..
GROUP MEMBERS
,! . !t~ Mori:I Nueem (:i:21 ;)812) Maria Naeem (i22 -0812)
LirN:ih Khat 1(221-07-10)
Aybt~aS-.ah d(221-2,1B 3)
FAST NUCES ISLAMABAD CAMPUS

Mashal
Masha/  is  a  mobile-based  accessibility  application,  designed  to  enhance  the  usability  for
applications  like  messaging  and  food  delivery applications  for  users  with  vision  challenges,
dyslexia, and age-related limitations. The system works as a smart overlay on Android devices,
providing real-time UI adaptation without requiring modifications to existing apps. It features a
Dynamic  UI  Adaptation  Overlay for text/icon enlargement, contrast  enhancement, grayscale
mode, and touch correction; an Al-Driven Personalization module utilizing NLP, OCR, TensorFlow
Lite, and OpenCV for sentence simplification, keyword highlighting, dyslexia-friendly fonts, and UI
element labeling;  and a Voice  & Interaction module powered by Android Text-to-Speech and
Accessibility  Service  APls  to  enable  offline  tap-to-read  and  intelligent  screen  narration.
Additionally,  Personalized  Onboarding  and  In-App  Customization  modules  allow  users  to
configure  reading levels, gestures, and app grouping according to their needs. Mashal aims to
promote  digital  inclusivity  by  transforming  non-accessible  mobile  interfaces  into  adaptive,
readable, and voice-supported environments, empowering users to interact independently and
confidently.
Key Words: Katlin, NLP, OCR, Android Accessibility API, Text to Speech
~ Masha)
Team IIINtl,e"
|     | Almsha Him  lJmarra Bajwa  | Rii'Tiil Tariq  |     |     |
| --- | -------------------------- | --------------- | --- | --- |
|     | 22Htl9  2211133            | 22UH5           |     |     |
A :smart mobtlc attcssibirttv appkat•o1 that enhance:. acce".".sibillty for people with visioo, cl'y~C)Qa,
m:I ~,e,..related limit.:tions usl'ls rea!li'n.:i smart featurt-s Ile dynamic VI <Wtfl.ly, /II text
!impliticatic),,, voiro!.llpport ;nd :iw pen:on;il~on fe:m..1rr,s.
Technology Used:
Katlin, Android Studio, Github, NLP, Tensorflow
Lite, Android Accessibility Service, OCR
| Thncllnc  |     |     |     | Su  ervisor Name:     |
| --------- | --- | --- | --- | --------------------- |
|           |     |     | l   | Mr. Bilal Khalid Dar  |
@
Group Members:
.., ...... ,.JON
Raima Tariq (i22 -1145)
• Alli.:.-.i'(fTn:I
| , UIM~gr,ifiotion  |               | • k:on Ubi.tln1  | • App         |     |
| ------------------ | ------------- | ---------------- | ------------- | --- |
| ,  Sman louch      | Simplifut10n  | • ~ey...,orc     | Pe~nili~:ion  |     |
, Cobf F~ter.  • Tap toRra"  Higl11iih e1  •  Qui1,~ nt~  Umama Bajwa (i22 - 1133)
| , Contr.ut Bordti':'.  | •  \TiPrf1\,IPQr.  | • o:J: Scnt,n Rud,,  | V'<Jrilill       |                          |
| ---------------------- | ------------------ | -------------------- | ---------------- | ------------------------ |
| , Grw.cale Mcdt        | supp::irt          | • U L.udtNrl         | • Srr;,irt .\tp  |                          |
| , On:>cardlne          |                    |                      | Cirwper          | Rimsha Azam (i22 -1129)  |
Tools1111d Technologies

FAST NUCES ISLAMABAD CAMPUS

|     | SpearkRight - |     | Al-Powered English Speech Coach  |     |     |     |
| --- | ------------- | --- | -------------------------------- | --- | --- | --- |
SpeakRight is an Al-powered application designed to help users improve their English
pronunciation through personalized, session-based practice. The app provides two core
experiences: Practice Sessions and Progress Tracking. In a practice session, the system generates
tailored sentences for the user to speak aloud. Each recording is processed through a multi-stage
analysis pipeline, consisting of transcribing the speech, Montreal Forced Alignment produces
phoneme-level alignments, Goodness of Pronunciation scoring, which identifies mispronounced
phonemes with Z-score normalization against native speaker baselines, and Prosody Analysis
evaluates six dimensions: pitch/intonation, speech rate, pause patterns, intensity, stress, and
rhythm. At the end of each session, the aggregated LLM summary provides severity-ranked errors,
actionable tips, strengths, and recommended focus areas. User history is maintained, enabling
adaptive sentence generation. Integrates a WhatsApp bot, allowing users to receive practice
sentences and submit voice recordings directly in WhatsApp for instant analysis, and a Chrome
extension that enables users to highlight any text on the web and immediately practice speaking it
with real-time pronunciation feedback, removing the need to switch to a separate application.
Features include:
Session-based pronunciation practice with difficulty levels.
End-to-end speech analysis pipeline.
Phoneme-level pronunciation scoring against native-speaker-normalized Z-scores.
Prosody evaluation (pitch, rate, pauses, intensity, stress, rhythm).
Structured LLM-generated feedback.
Adaptive, personalized sentence generation based on accumulated user history.
WhatsApp bot & Chrome Extension for on-the-go practice.
Key Words: Speech Coaching, Montreal Forced Alignment, Prosody Analysis, Phoenetic Analysis, LLM-
Powered Feedback.
SpeakRight
SpeokRight is on Al-powered communication platform that helps indMduols
speak cleorty. confk:lentty, ond ettectlvely
| Architecture  |      |     | i              |     |     |     |
| ------------- | ---- | --- | -------------- | --- | --- | --- |
|               | App  |     | O,roag,te-ss-  |     |     |     |
UMtlnput
lfilllJ
|     | $.po.o l-llllgh~tCo-reEn-glne-  |     | ~  =  |     |     |     |
| --- | ------------------------------- | --- | ----- | --- | --- | --- |
= .:;::..
= -.-::. -...
|     | {  @] } |     |     |     |     |     |
| --- | ------- | --- | --- | --- | --- | --- |
WhaltApt,
|     |     |     | AlfNdbactr.  |     | Technology Used:  |     |
| --- | --- | --- | ------------ | --- | ----------------- | --- |
Python (FastAPI), React, Whisper ASR,
Timeline  Montreal Forced Aligner, Facebook Wav2Vec2,
Eiiiii&
LLM, Supabase (PostgreSQL + Auth), Docker,
AWS EC2, Nginx, WhatsApp Bot
|     |     |       | .   |     | Supervisor Name:  |     |
| --- | --- | ----- | --- | --- | ----------------- | --- |
|     |     | ·-. - | __  |     |                   |     |
..................
'  Dr. lmran Ashraf
| • .A..S,•,&,.,.M_.O.,nlpN1Optef,O,.K.. eid  | • O roo d nee eo4       | ·. . o-., _ . ..-              | ,-  ............                          |     |     |     |
| ------------------------------------------- | ----------------------- | ------------------------------ | ----------------------------------------- | --- | --- | --- |
|                                             | ~ f o d o n~            | lr nt  6 .........             | -·                                        |     |     |     |
|                                             | " ° " " ' ° " " " ' - - | - - °'  •o-.,,toye·inAW IIC:J  | •  M a tu t al  T T S t o,  n c rt u rd   |     |     |     |
•  l " r o a o d y  A n a t y l, I •  - n G t h o e  b o M l n e .   Group Members:
| .p .h . ~, .h _, r o   t • , , - . . | . .  •  l " ro tl O t y p 9  F N < d b | o d l  | .   u - ' " t i n t "  l m p o v 9   |     |     |     |
| ------------------------------------ | -------------------------------------- | ------ | ------------------------------------ | --- | --- | --- |
| l n t e n a k y , l tt M & ,         |   O.~wfttiltAG                         |        |                                      |     |     |     |
Muhammad Ariyan Chaudhary (i22 -1035)
| Tools  |     | Team  |     | Muhammad Ali Naveed (i22 -0778)  |     |     |
| ------ | --- | ----- | --- | -------------------------------- | --- | --- |
22,-0778 M..!Nm~ ti,J PuVffd
22t-1211Hamlll0m«
|     |     | 22H035 Mul'lammad Nrpn ~l'lar)'  |     |     | Hamza Omer (i22 - | 1218)  |
| --- | --- | -------------------------------- | --- | --- | ----------------- | ------ |
Supervisor
Dr 1"1ran Ashraf

FAST NUCES ISLAMABAD CAMPUS

QCanvas
QCanvas is a unified web-based IDE and simulation platform designed to solve fragmentation in quantum
computing software. It acts as a universal translator, allowing users to write, visualize, and execute quantum
circuits from major frameworks (Cirq, Qiskit, Pennylane) through a standardized OpenQASM 3.0 interface.
Features Include:
• Translates Qiskit, Cirq, and Pennylane quantum circuit code into a standardized OpenQASM 3.0
format.
• Provides an interactive, Monaco-based web editor with real-time syntax highlighting, visual circuit
diagrams, and live diagnostics.
• Executes quantum circuits using built-in Statevector, Density Matrix, and Stabilizer simulation
backends.
• Utilizes a hybrid architecture that clearly separates classical CPU orchestration from the quantum
simulator execution.
• Renders interactive measurement histograms and real-time execution statistics using Chart.js.
• Performs semantic validation to ensure all generated code conforms to the supported subset and
hardware constraints.
QCANVAS ~-w.:.-::::. Keywords:
,AOt.PMlHIGS Quantum Simulation
A Unified Web-based Qlentum ::::""~':-,.,
COmpudng Piatform "'._ff_,,.._.,,._,
Cirq, Qiskit, Pennylane, OpenQASM 3.0
Moti~tlon:
AST Parsing, Hybrid Architecture, Web IDE
Key Foaturu:
Technology Used:
Next.js 14, React 18, Typescript, Tailwind CSS
outcomos: AppUcaitions:
Monaco Editor, Python 3.11+, FastAPI
Qiskit, Cirq, Pennylane
Supervisor Name:
Dr. lmran Ashraf
Group Members:
R.sutts: Umer Farooq (221-0891)
" C "! l .1 < ,, - ,4 > .. - 5. • , W m ... • s • ,. • . . . . > ,:; 3 ;; 0 ,: 4 -_ . n::: 1 : C :,~ O : % ;.:: ,... '.:'.;'.~'. 3 .;' • ~ :=
Hussain Waseem (221-0893)
o,.,..,_.,._,... I ............
i m•
s)<",'" '"; CHQ ,, \ , 0 C,S:API ,> " ... Muhammad lrtaza Khan (221-0911)
FAST NUCES ISLAMABAD CAMPUS

GolfCoach
GolfCoach is an Al-based golf swing analysis system designed for amateur golfers and coaches. The
system has two views - User View and Admin View. In User View, golfers upload swing videos
recorded from a standard camera and receive automated analysis including swing phase detection,
biomechanical fault identification, ball tracking, and performance prediction. The system generates
clear coaching feedback in both text and audio format to help users improve technique. Users can
submit feedback if results are inaccurate or unclear.
In Adm in View, flagged sessions are reviewed, predictions are validated, and necessary corrections
are applied. Verified updates are used to refine the dataset and continuously improve model
accuracy and reliability.
Features include:
20 & 30 pose estimation (33 keypoints per frame), 5-phase swing segmentation (Address to Follow-
Through), Biomechanical fault detection with severity analysis, Ball tracking & trajectory estimation
using  Al,  Performance  prediction  (ball  speed,  carry  & total distance), Al-generated  coaching
feedback (text+ audio), Web dashboard with session history and progress tracking,
Admin review panel & dataset updates
Key Words Computer Vision, Pose Estimation, Deep Learning, Sports Analytics, Biomechanics
@)
NOtk>nol l.JrWerstty of computer & Emerging sciences
Dltportnwm of C.omput• SCHtflCe -11.kJmoboa c.ornp..s
GolfC  oach
Al-Powered Coif Swing Anolys.is System
An Al-based p\<llfotm usmg comput•r v s.ior, i,nd deep learning to analyzer
golf swings and gr,,,. bomec;!'l.nk;al feedback UMng -.ideo inpvt.
| e                        | 0                       | 0                  |     |     |
| ------------------------ | ----------------------- | ------------------ | --- | --- |
| Zain UI Abidln 221 2738  | Muneeb Akht•r 211 0S20  | U,.,..,. JaNlngir  |     |     |
0
| SUPERVISOR  Or. Ahmad R.i,ui, Shahid  | C:0-.Supo,v,co,  | 0.,, MGhraon 1\1.am  |     |     |
| ------------------------------------- | ---------------- | -------------------- | --- | --- |
l!I PROBLZ.M
SOLUTION
0 Afford3bl• .S. ~Sible
| • TrAnit~llyNXt~        |                          | o ~ault~~n        |                   |     |
| ----------------------- | ------------------------ | ----------------- | ----------------- | --- |
| U 5,000•S75,000         | 9odypo<e&cw>,ganal><I<   | .S. feedback      |                   |     |
| • Reauires multk:amera  |                          |                   | Technology Used:  |     |
| ~ te-rns                | rault detection&Nedb-=k  | Real tlm• from:i  |                   |     |
Slngle SWlnQ V deo
React.js, Tailwind CSS, Node.js / Express.js,
D KEY FEATURES
O Pose Tracking  O Swtng Analysts  O Fault Oeteetlon  o Sall Tracklng  Python/ FastAPI, MediaPipe Pose,  YOLOv8,
| • 33kll)'POlfltS  | SmmAI~  | Tr~Ofy&  |     |     |
| ----------------- | ------- | -------- | --- | --- |
d:stance  OpenCV, PyTorch, Scikit-learn, PostgreSQL, AWS
| G) PERFORMANCE RESULTS      |               |         | 53,Docker, Git/ GitHub  |     |
| --------------------------- | ------------- | ------- | ----------------------- | --- |
| ..; 92.3%  Phase Detection  | .., 15.3 FPS  | 4.45/5  |                         |     |
AcCUrOCf  Pose E~inwtion  U:.cr Sotbfaction  Supervisor Name:
|     | TOOLS & TECHNOLOC-rES  |     | Dr.Ahmed Raza Shahid  |     |
| --- | ---------------------- | --- | --------------------- | --- |
Group Members:
OEVELODMENTTIMELINE
|          |               |              | Munib Akhtar (i21 - | 0520)    |
| -------- | ------------- | ------------ | ------------------- | -------- |
| Jan-Feb  | Mer-Apr       | Moy-June     |                     |          |
|          | T.,..._~ing&  | °""""'"""''  |                     |          |
|          | lntegmtion    |              | Umer Jahangir(i21   | - 0617)  |
Zain UL Abdin (i22 -2738)

FAST NUCES ISLAMABAD CAMPUS

Cloud-Native Automated Vulnerability Detection and Repair
Our web application enables users to upload their GitHub repository, a project folder, or even a
code snippet to check for vulnerabilities. Initially, it performs static analysis using either CodeQL or
CppCheck depending on the user's selection. It generates a report and then proceeds to dynamic
analysis, which validates the vulnerabilities identified by static analysis by performing fuzzing in
parallel within containers deployed on the cloud and managed by Kubernetes. Once confirmed, it
proceeds to rule-based patching of the code for vulnerabilities where this is feasible; otherwise, it
applies an approach derived from the research paper VulRAG, where embeddings of the CVE
database are created along with instructions to patch that vulnerability for an LLM. After the patch
is generated, tests are executed to ensure the code is now free of vulnerabilities.
Features include:
Upload code through one of 3 methods (GitHub Repo, Project Folder, Code Snippet)
Automated report generation for static and dynamic analysis
Automated patch generation
Monitoring through Prometheus and Grafana
Cloud-based parallel execution of Docker containers performing dynamic analysis
CVE database integration through the VulRAG technique to assist the LLM
Key Words: (Prometheus, Grafana, Fuzzing, VulRAG, Kubernetes)
AUTOMATED
VULNERABILITY
ANALYSIS & PATCHING
PLATFORM
Upload your Git Hub repository, project folder, or
code snippet to scan for vulnerabilities and
automatically generate patches.
Q
KEY FEATURES:
Upload code through one of 3 methods:
• -• (GitHub Repo, Project Folder, Code Snippet)
~- Automated report generation
for st:itic and dynamic analysis Technology Used:
r;fJ
Automated patch generation Python, Flask, Redis, Celery, Prometheus,
() Monitoring through Prometheus and Grafana Grafana, Kubernetes, Docker, Langchain, FAISS
.nl.L Cloud-based parallel execution of Su ervisor Name:
9"" Docl<cr containers performing dynamic analysb
Dr. Arshad Islam
m CVE database integration through the
• VulRAG technique to assist the LLM
Group Members:
TECHNOLOGIES USED:
Alishba Naveed (i22 -0808)
,! Python ~lask ... Redis Ejl Celery
() Prometheus ,eGrafana • @ Langchoin Adan malik (i22 - 1000)
() kubernetes Docker ;!! FAISS Jawairia Waseem (i22 -1274)
FAST NUCES ISLAMABAD CAMPUS

AuraSense:
AuraSense is a Wi-Fi CSl-based Human Activity Recognition (HAR} system built for contactless, real-
time monitoring of elderly individuals. Instead of cameras or wearables, it uses the Wi-Fi signals
already present in any indoor space to detect what a person is doing - walking, sitting, standing,
running, or falling.
When someone moves, their body disrupts the Wi-Fi channel around them. AuraSense captures
these disruptions (Channel State Information), runs them through a deep learning pipeline, and
classifies the activity in real time. The system is especially focused on fall detection - one of the
leading causes of injury-related deaths in adults over 65 - sending an instant alert to caregivers
the moment a fall is detected.
Features include:
- Real-time activity recognition using Wi-Fi CSI signals (no cameras, no wearables required}
- Automatic fall detection with instant caregiver alerts via push/SMS notifications
- GenAl-powered natural language summaries - e.g. 'User has been inactive for 40 minutes'
- Live monitoring dashboard showing activity feed, signal strength, and event logs
- Historical session reports for caregivers and facility managers
- Multi-environment support - tested across different rooms and hardware setups
Keywords: Wi-Fi CSI, Human Activity Recognition, Fall Detection, Deep Learning, Privacy-
Preserving Monitoring
AuraSense
AeaHlme ecttv1ty monitoring
through WIA sfgn.a._
CONCEPTUAL WORKFLOW
Technology Used:
Technology Used:
OUR SOLUTION
Python, TensorFlow / PyTorch, ESP32, Intel
5300 NIC,
React, PostgreSQL, REST API, PyWavelets,
Scikit-Learn, GitHub, Mlflow
Supervisor Name:
TI MELINE
Ms. Urooj Ghani
Group Members:
Amman Haroon (i22-0768)
Abdul Samee (i22 -1051)
TOOLS AND TECHNOLOGIES
Abdul Rafay (i22 - 0843)
FAST NUCES ISLAMABAD CAMPUS

Retina Scope
RetinaScope is a web-based, Al-powered decision support system designed to improve clinical
workflows by assisting ophthalmologists and optometrists in the early detection, grading, and
management of ocular diseases through the automated analysis of 2D retinal fundus images. The
system caters to three primary user roles:
• Optometrist View: Allows optometrists to create and manage patient visits, upload fundus
images, perform image quality checks, and run initial Al predictions before forwarding cases
for expert review.
• Ophthalmologist View: Enables specialists to review forwarded cases along with their
predictions, check Al-generated heatmaps for verification, finalize medical diagnoses, and
finalize comprehensive PDF reports.
• Admin View: Provides capabilities to manage user accounts and approve new registration
requests from medical professionals.
Key Features
• Multi-Disease Detection: Automated grading of Diabetic Retinopathy into S clinical stages and
detection of Pathological Myopia using 2D retinal fundus images.
• Explainable Al (XAI): Generates heatmaps to visually highlight regions of concern (e.g.,
microaneurysms or myopia-related changes) for clinical transparency.
• Structured Data Management: Organizes patient records, patient history, fundus images, and
their predictions to improve retrieval for follow-ups.
• End-to-End Workflow: Features a seamless pipeline from patient intake to PDF report delivery.
e
RetinaScope • Key Words
• Full Stack Al Web Application
Su~'TViSOr: Ms. I lir-o '\Anstoor
Maryuni I unv1r 221w075 J Su Iman Khan 221-12~5 • Computer Vision based Image Analysis
• Clinical Decision Support System
0 Objective
• Al in Healthcare
R~tin~1Scope is a ful.1-stuck <wo;;b ~pplicution for Al-bas<.,d cyo disc:,sc
dcLcct1on and cl1n1cal data 1nanage1-ncn1.11 1s designed as a dcc1s1on
suppof"t tool llml helps; ophtlmlmolu~isls quil.:kly mmlyr..c n::tirm fumJus • 2D Retinal Fundus Imaging
images. visualize discnsc-rclcvonl regions using c:xploinoblc Al, nnd make
rnnrc informed diagnn~tic deci~ions hy cnn,hining Al l"lrcdic1io1"''-U1ith • Diabetic Retinopathy (DR) Grading
1:>aticnt his1ory.
• Pathological Myopia (PM) Detection
0 '\,Vorkflow Design
• Explainable Al (XAI)
• Dataset Collection & Preprocessing
• Structured Data Management
cO-e•c•to•r R"'~•-le•l.\.1.. . · . n ,. . . • , .• 2- ( • )p U t M w 'P t1 r1 . e .r b h , n t . tl'•.l.l.•..a. t. ,R. ..f.!.f.t.h..· ts
Rf'peM •• 0p. .- rln R,rpen
Technology Used:
0 Features
Python, TensorFlow, Pytorch, OpenCV,
Diabetic R.c.«inopnthy Orodiog Pmhologicol Myopio Detection
GradCAM, React.js, FastAPI, MySQL, ViTest,
Orc.nniZed Dotn & Work.flow Report Oc.ncration
Postman, Kaggle, Figma, VS Code, GitHub, Git
0 Tools & Technologies
Supervisor Name:
Ms. Hira Mastoor
Group Members:
Maryum Tanvir (i22 - 0751)
0 Collaboralors
...,A.VAT £VE HOSPITAL Salman Khan (i22 - 1285)
PAIYATELMITED
FAST NUCES ISLAMABAD CAMPUS

PropPal
PropPal is an Al-powered real estate platform built specifically for Pakistan's property market, designed from
the perspective of buyers, sellers, and builders. Buyers can use natural language (and voice) to search for
properties (e.g. "3-bed apartment in Islamabad under 1 crore"), receive semantic and chat in real time with
intelligent agents that understand location, price, and property features. The platform supports amenities-
aware search, where properties are enriched with information about nearby schools, hospitals,
and other key points of interest so that users can make more informed buying decisions; in addition,
users can search for properties near a specific landmark or place (e.g. "a house near FAST
University Islamabad"), and the system will retrieve and rank the closest relevant listings. Builders can create
rich company profiles, list their construction/renovation services, and be discovered through the same Al-
driven search experience, making it easier for users to find relevant builders and services alongside
properties.
Features include:
• Conversational property search: Natural language and voice-based queries for location, budget, and
property features.
• Amenities-based intelligence: Property search enriched with nearby schools, hospitals, and other
amenities, plus "near X place" queries (e.g. universities, offices, landmarks).
• Semantic vector search: Qdrant-backed similarity search over property, builder, and service
embeddings.
• Buyer, seller, and builder views: Separate dashboards for searching, listing management, and
builder/service visibility.
• Agentic visit booking: An Al-driven booking agent that helps users schedule property visits by
coordinating preferred time slots, property availability, and builder/agent calendars, automatically
creating and updating visit requests.
:XewmHem..,.re-
•-=.--=---.-.~...- o n~. ....~..I.=.. --_=) ., _ :_
PROP
Agontic Roal Es1:ata Platform
Pipeline:
1
Technology Used:
FastAPI, Next.js, LangGraph, PostgreSQL, Qdrant
Supervisor Name:
Features: Dr. Akhtar Jamil
N La e n a d rb m y a A rk m Q e u n e it r ie ie s s I C P V r o o lc p c e - r E ty n u S b e l a c r d c h Group Members:
Olscover propenles clos1 ~=i~~'!'::~r.;'Jatural
to points or interest lon9uo9e command:,. Muhammad Bilal (221-0806)
Automated Visdt
Sm~rt User Booking
;;;;;; D P B fl' e u l a r r i - l s s R d o h u e n y r b a c P o l r i A z a . e r S d d :P i s l n l " t ~ ' e r:i r ::t r . a A c n e d s c, v c A i c l s - h r it t e s r d iv u "'1 l n ln , g r. n fo n1 r 1 1 p :!!X r f o •: p 'I e W r l\ t r y A Rana Bilal Akbar (221-1094)
.,.. Mehboob Ali Shah (221-1208)
Tools:
..--- drant
FAST NUCES ISLAMABAD CAMPUS

AutoHPO
Adaptive Explainable NSGA Framework for CNN Hyperparameter Optimization
This project introduces an adaptive, explainability-guided framework to make CNN hyperparameter
tuning more efficient and transparent. By combining multi-objective search (NSGA-1I), explainability
(SHAP), and adaptive resource allocation (Multi-Armed Bandits), the system intelligently focuses
computational effort on the most impactful hyperparameters. This balances competing objectives
like model accuracy and training time, achieving better performance while eliminating unnecessary
"black-box" experiments.
Key Features:
• NSGA-11 Search: Optimizes conflicting objectives simultaneously to find the best trade-offs.
• SHAP Explainability: Uses a LightGBM surrogate model to quantify and rank
hyperparameter importance.
• Adaptive Selection (MAB): Prioritizes mutations based on SHAP metrics and performance
gains to save compute resources.
• Streamlit Dashboard: Visualizes Pareto fronts, ablation studies, and optimization trends in
real-time.
Key Words: Hyperparameter Optimization, NSGA-11, SHAP, Multi-Armed Bandit, Convolutional
Neural Networks.
PROBLEM SOLUTION Technology Used:
Black-box Optimisation Explainable Tuning Python, PyTorch, scikit-learn, LightGBM, SHAP,
Res.ourc;e Wa:s.tage Adaptive Re:s.ource Alloc~tion
Lack of Adaptivity Efficiency-Guided NSGA 2
Pandas, NumPy, Streamlit
WORKFLOW Supervisor Name:
· v•!!!!l!IIII~
Dr. Hina Ayaz (Supervisor)
Dr. Afia Zafar (Co-Supervisor)
NSGA-11 Opt SHAP Analysis MAB Decision Improved
Mutation Group Members:
TECH STACK Muhammad Musayyab Haider (i22-0862)
Q
Muhammad Sohaib Bari (i22-1029)
Amin Adnan (i22-0816)
FAST NUCES ISLAMABAD CAMPUS

Social Monkey (Al-driven Social Media Analytics Platform)
Social Monkey is an Al-driven social media analytics platform designed to provide deep,
emotionaware insights into Twitter/X content. Unlike traditional sentiment analysis that only tracks
"positive" or "negative" tones, this system utilizes a fine-tuned BERTweet transformer model to
detect 27 fine-grained emotions (e.g., admiration, gratitude, sarcasm, and nervousness).
The platform is built for content creators and marketers to understand the emotional impact of
their digital presence. It features high security architecture, implementing Twitter OAuth 2.0 with
PKCE and Fernet encryption and includes a specialized Gen-Z slang detection system to track
modern communication patterns. Users can interact with five dynamic dashboards to visualize
emotional trends, identify negative triggers, and determine optimal posting times via temporal
heatmap analysis Key Features:
• Deep Emotion Analysis: Multi-label classification of 27 distinct emotions using a Fine Tuned
BERTweet model.
• Gen-Z Slang Detection: Dictionary-based pattern matching for 70+ terms (e.g., "no cap,"
"bussin," "slaps").
• Interactive Analytics Dashboards: Five specialized views (Overview, Emotion Analysis,
Negative Triggers, Heatmap, and Gen-Z Insights).
• Real-time Data Ingestion: Integration with Rapid Api's twitter-api45 to fetch up to 100
tweets per request with CSV export and real-time engagement metrics functionalities.
Technology Used:
Backend: FastAPI (Python 3.9+), SQLAlchemy,
ORM, Uvicorn
Al/ Machine Learning: BERTweet-base,
PyTorch, Transformers (Hugging Face),
GoEmotions Dataset, custom Slangs Dataset
Frontend: Vanilla JavaScript, Chart.js 4.4.0,
CSS3
Database: PostgreSQL, Supabase
APls & Auth: Twitter OAuth 2.0 (PKCE), Rapid
API, JWT Bearer Token
Testing & DevOps: Pytest, Heroku Deployment
Supervisor Name:
Dr. Sana Aurangzeb
Group Members:
Ahmed Ali (i22 -0825)
Qusai Mansoor (i22 -0935)
Ahmad (i22 - 1288)
FAST NUCES ISLAMABAD CAMPUS

FightSenseAI
FightSenseAI is a specialized software application designed to automate tactical analysis and
counter-measures prediction in boxing through computer vision and deep learning. The system
transforms raw recorded boxing match footage into structured, data-driven reports, providing a
strategic edge for coaches and athletes. It offers a comprehensive view for coaches or athletes to
review tactical habits and a sports analyst perspective for narrative-driven insights. The platform
eliminates time consuming manual video reviews by identifying an opponent's behavioral patterns
and pro actively suggesting exploitative strategies.
Features Include:
- Automated Action Recognition: Reliable classification of 9 fundamental boxing actions
including various punches and defensive maneuvers.
- Behavioural Pattern Mining: Identification of recurring combinations and tactical
tendencies through advanced temporal sequence analysis.
- Counter Strategy Generation: Synthesis of behavioral insights into actionable advice
presented as action reaction pairs to exploit weaknesses
- Tactical Dashboard: Visual representation of fight analytics, including punch counts, activity
timelines, and win probability impact
Key Words: Computer Vision, Deep Learning, Action Recognition, Pose Estimation
8
Fight enseAI
.- . i .. •. ., •- __ . ~ _ ,. - .p _ e < _ lc< . i d oo t hb s ao l cr J c tlr I ou O gl, .... d ,_Y . . i .s.io_r,l_ a >N n f d \1 ~ 1S ~ an d
--------
nto,rn:NO
---- - - ! - -- I i5i -. i . _ 1
---
-=·
'-- --
-
Technology Used:
I
Python, fastapi, react, Shadcnui, Git, docker,
I
Typescript, PostgreSQL, Ultralytics yolo
I•. ..
:- -
-~
-
t
- Supervisor Name:
Dr. Ahmad Raza Shahid
Team Me111e11ers Group Members:
,.,_._C»·OIJO) Amna Siddiqui (i22-0830)
~f¥.llll2H0'61
~M(221-(W14)
Daniyal Faraz (i22-1096)
Hammad Ali (i22-0914)
FAST NUCES ISLAMABAD CAMPUS

Urooj - Al-Driven Health Monitoring and Lifestyle Guidance for PCOS
Urooj is an Al driven health monitoring and lifestyle guidance application specifically designed to
support women managing Polycystic Ovary Syndrome (PCOS). Featuring a seamless mobile
interface built with React Native and a robust backend architecture using FastAPI, PostgreSQL,
SQLAlchemy, and Supabase, the application leverages advanced machine learning and natural
language processing to deliver highly personalized health insights.
Features include:
• Predictive PCOS risk scoring utilizing a ML XGBoost classification model.
• Advanced menstrual cycle prediction tailored for irregular health data.
• UraAI, an agentic chatbot providing guidance based on multimodal user context.
• Culturally appropriate nutrition guidance with personalized meal recommendations and
calorie tracking.
• Expert approved, PCOS friendly workout plans featuring video guidance and progress
tracking.
• Secure, ACID compliant data management via a FastAPI and PostgreSQL backend.
Key Words: React Native, FastAPI, PostgreSQL, Supabase, Conversational Al, Machine Learning
FAST National University of Computing
and Em~ging Sc.MncH
LROOJ
Urooj: 1--\1D riven Health Monitoring
and Lifestyle Guidance fi)I" PCOS
Our Molivolion St1~n"isor:
M'->. S.:iirn Q.irn<H
tt 1-10 •,...omen in Pakistan are "lh1111,\k:t11l.N.:ri-:
afk,c;U?d by PCOS,yet cul1ural Sana rat ma W'ir • i221160
bcm10rs delayd agnos1i. A~~;;i Kiani i221283
Abduhchm-0n B;;i och • 1221182
,.. Existing apps are gener e
"a .1nd culturally disconnected
Key Feolures
• Secure, mobile-first cycle and hol st:::
\Vellness rionitoring. Technology Used:
• Early and accu•ate ?COS risk pred ction
using Wachin<! learning
• 'J4tl t>mp;ithP.""K.:. NI P-drf-.,pn mstant React Native, Python, FastAPI, PostgreSQL
support.
70% 50% 3-Sx • Localized, PCOS-friendlyd et and V deo SQLAlchemy, Supabase, LangChain, XGBoost
\'IOfko1.1t plars.
Supervisor Name:
System Architecture
Ms. Saira Qamar
Presc:mtation Tier: Logk:al Tier. Data Tier:
Mobile App ~plicat on Server• AP Gatw,:ay Cloud Backe,id
Group Members:
Sana Fatima Mir (22i-1160)
Muhammad Abdulrehman Baloch (22i-1182)
Ayesha Kiani (22i-1283)
FAST NUCES ISLAMABAD CAMPUS

|     |     | HEALIX- | Al-Powered Healthcare Assistant  |     |     |     |
| --- | --- | ------- | -------------------------------- | --- | --- | --- |
Al Healthcare Assistant app is being made, whilst keeping the perspective of patients and healthcare
professionals. There are two views of this app - User View and Doctor View - the former is for the
patients to use the features provided by our app to check drug-drug interactions, analyze drug-food
interactions,  get  medicine  alternative  suggestions,  manage  medication  reminders,  and  ask
healthcare related questions in natural language. The user can also manage appointments, receive
notifications, and maintain personal health records within the system. The latter is for the admin
or healthcare professional, who manages system data, monitors interactions, updates  medical
recommendations, and ensures accurate responses and safe medication guidance for users.
Features include:
•  Healthcare related queries including drug-drug interactions and drug-food interactions.
•  Intelligent medicine alternative suggestions using Al models.
•  Medication reminder system with notification alerts for patients.
•  Appointment management and health record monitoring.
•  Dataset and system knowledge updated after admin doctor verifies and answers the query.
Key  Words:  Artificial  Intelligence,  Healthcare  System,  Machine  Learning,  Drug  Interaction
Detection, Web Application.
e
H EALIX Al POWERED
| !t  | ASSISTANT  |     |     |     |     |     |
| --- | ---------- | --- | --- | --- | --- | --- |
HEALIX
SYSTEM ARCHITECTURE
o:i
| il  |     |     | ®   |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
Patient/O~r
| Interface  |            |     | Anelysi~  Actionobfe  |     |     |     |
| ---------- | ---------- | --- | --------------------- | --- | --- | --- |
|            | Ingestion  |     | Engine  tnstgh1s      |     |     |     |
(NLP & lrnaof!
Analy1i1)
Patient/
Doctor
| m   |     |     |     |     | Technology Used:  |     |
| --- | --- | --- | --- | --- | ----------------- | --- |
React.js, Node.js, Express.js, MongoDB, Python
| • Drug-Drug  | • Drug-Food  | • AI-Bosed  | • Medicotion  |     |     |     |
| ------------ | ------------ | ----------- | ------------- | --- | --- | --- |
Interaction  Interaction  Medicine  Reminder  (Flask), CatBoost, XGBoost, Material-UI, Vite,
| Oetec1ion  | Risk Analysis  | Alternatives  | System  |                                              |     |     |
| ---------- | -------------- | ------------- | ------- | -------------------------------------------- | --- | --- |
| -          | @)             |               | ((  )}  | Typescript, RDKit, PubChem API, Nodemailer,  |     |     |
.  • Al Chatbot  • Health Record  • Notification  Node-cron, VS Code, Git/GitHub.
|     |     | Summarization  | System  |     |     |     |
| --- | --- | -------------- | ------- | --- | --- | --- |
Supervisor Name:
Technology Used:
React.js  Node.js  CatBoost XCBoost  PubChem API Nodemailer  Mr. Owais ldrees
| Express.js  MongoDB  |     | Materlal-UI  Vite  | Node-cron  VS Code  |     |     |     |
| -------------------- | --- | ------------------ | ------------------- | --- | --- | --- |
| Python (Flask)       |     | Typescript  RDKII  | Git/GitHub          |     |     |     |
Group Members:
KEY PERFORMANCE RESULTS
| 95%  |     | 92%  | 2-5s  |     | Waseem Zahid (i22 - | 1355)  |
| ---- | --- | ---- | ----- | --- | ------------------- | ------ |
,,.._J\..
| Drug-Drug Interaction      |     | Drug-Food Interaction     | Average Response  |     |                          |     |
| -------------------------- | --- | ------------------------- | ----------------- | --- | ------------------------ | --- |
| Accuracy                   |     | Accuracy                  | Time              |     | Faizan Khan (i22 -1356)  |     |
| PROJECT TEAM & SUPERVISOR  |     |                           |                   |     | Tooba Ali (i22 -0807)    |     |
| Group Members:             |     | Faizan Khan (i22 • 1356)  | Supervisor Name:  |     |                          |     |
| Waseem Zahid 122-1355      |     | Tooba All 122 • 0807      | Mr. Owais ldrees  |     |                          |     |

FAST NUCES ISLAMABAD CAMPUS

Zaiqa
Zaiqa: A Context-Aware Al-based Cooking Assistant is being made, whilst keeping the perspective
of Pakistani households. There are two views of this app: User View and Ad min View. The former is
for users to use the features provided by our app to Search and Discover Recipes based on available
ingredients, budget limitations, and context-aware elements like weather and time, in natural
language i.e. English and Roman Urdu. Users can express their cravings by typing them and can use
the feedback loop to rate recipes or submit technique clarifications. The latter is for the ad min, who
performs content management including bulk recipe uploads. Admin also monitors the analytics
dashboard to view the most skipped recipes and peak usage hours, ensuring the price engine and
dataset remain accurate and updated for the end-users.
Features include:
Bilingual Chat bot Assistant supporting English and Roman Urdu.
Semantic Ingredient-Based Search using FAISS vector matching.
Dynamic Per-Serving Cost Estimation based on local market rates.
Context-Aware Recommendations (Weather, Time, and Festive Events).
Culturally Localized Dataset and Ingredient Substitution Logic.
f zAIQA
Al Th;it Undcrst~nds Your Cravings, Culture & Context
Context-Aware Food Recommendation & oec1s,on Suppert System
Cooking Asisstant.
Technology Used:
Python (Django REST), Flutter (Dart),
PostgreSQL, Hugging Face, Kotlin
Supervisor Name:
Timeline
Mr. Pir Samiullah Shah
--
......
Group Members:
Ibrahim Shahid (i15 - 0873)
Aman Noor (i22 - 0972)
Hania Aamer Mehboob (ilS -1154)
Tools - ...T.u- ..m..M..e mbef- ,·•.; .,,
r' E: G Q
_,.._.....,.n,y..,
Postgr._SQl ~Mr.Nr.........,....,.
FAST NUCES ISLAMABAD CAMPUS

OratoAI
OratoAI is an Al-powered web application designed to assist Pakistani students in improving their
oral presentation skills through automated feedback. The system analyzes pre-recorded solo
presentation videos by processing audio and video data to generate detailed reports focusing on
vocal clarity, body language, and content relevance. This platform addresses the challenge of
limited and subjective feedback by providing scalable and culturally localized coaching.
Features include:
• Computer-vision-based posture and gesture analysis to evaluate pose keypoints, head
orientation, and gesture metrics.
• Accent-aware automatic speech recognition (ASR) tuned for Pakistani English to track
speech rate, pauses, and filler words.
• LLM-assisted content relevance checking to verify the alignment of spoken content against
a user-declared topic.
• Comprehensive feedback reports and an interactive dashboard to track historical
submissions and performance trends over time.
Key Words: Multimodal Analysis, Computer Vision, Speech Recognition, Presentation Coaching, EdTech
ORATOAI
Al-POWERED CO Ml IIIICI\" ION
& Pll.ESE A COACH
THE CHMLEN6E: Publ c speok.11111. an,aet'.', inl:lffect111ij delwery, and
lad ofobjecti11e hhtdback hindecprof155ional growth
OUR MISSION: To empower ln<lf\'laua[S w1:n rea1-t1me, A1-ar1\len
insights on visvll, guditory,o.nd contcnto)poct:iof their prc3Cl'lta1icn:i
for R'e>a!.l..lrablC! impro\lC!m~nt
Key Featurts
@, vs11allr.'IS:illctAnaly1ls Acc«it Awa rt Speech
H~:al·tllnc feoobcc\ on coay DC:alCd ilfl.11.)'5'. of lone, ?-ICC
Ill" t\Xl! U'ld tyt cor t1CL 1111dcr,cn1m:i1tipr,
Technology Used:
c:ont. .t 11111,.,,. .n t l\n:ilvtlc$
Cn:MJressoeee~ rele-.anoe uid J Tracborc11:·ess0\·ertimefo1
.-,~rrativefON <ont ,........,,;mpro_,.,..,.. React, FastAPI, Python, MediaPipe, OpenCV,
The ArchltCCnM'C NVIDIA Parakeet, Post reSQL, MinlO
Su
Ms Saira Qamar
Group Members:
Ali Haider (i22 -1210)
Shayan Memon (i22 -0773)
l!'10 1~cn ~taCk
•"-:-:.~: I,h.i c. Awa is Khan (i22 -0997)
.J ··~ -N= 1h\vll /
IIIIIIIE""" IVllJIA
FAST NUCES ISLAMABAD CAMPUS

Agent-Based Dynamic loT Honeypot System
HoneyMesh is an intelligent loT honeypot system designed to detect and analyze cyber attacks
targeting loT devices. The system simulates realistic loT services and device behavior to attract
attackers and observe their activities in a controlled environment.
It uses an agent-based architecture where specialized modules monitor network traffic, simulate
loT services, generate normal device activity, and analyze attacker behavior. Machine learning
algorithms are used to detect anomalies and classify different types of attacks. It integrates Al-
based anomaly detection and attacker profiling for intelligent threat analysis.
The system helps security researchers understand attacker strategies and improve loT network
defenses.
Features include:
• Real-time network traffic monitoring and anomaly detection
• Simulation of loT protocols such as MQTT, HTTP, Telnet, and CoAP
• Generation of realistic loT device activity
• Attacker profiling and attack classification
• Provides valuable threat intelligence to strengthen loT security and defense strategies
Keywords: loT Security, Honeypots, Machine Learning, Cybersecurity, Network Monitoring
gent-Based Dynamic loT Honeypot System
Comlinea multi-agent architecture and machine learning
for proactive detection and deception.
OBJECTIVES SYSTEM ARCHITECTURE
Simulate realistic lol devices
Capture malicious traffic
Detect anomalies using ML \ H~Mesh C'nre J
Profile attackers using Al
Support HTTP, MOTT, Telnel, CoAP
Technology Used:
Python, FastAPI, MQTT, HTTP, Telnet, CoAP,
Ql of lnillal datasets,
coltecdon ol llasaline traffic
Isolation Forest, XGBoost, Docker
Supervisor Name:
Mr. Ahmad Raza
Group Members:
Zain Raza (i22-0520)
FUTURE WORK Malaika Afzal (i22-0885)
Real loT Hardware lntegratlm Advanced Relnfortement Learning
Clouc!Dlplo'fmenl Sajer Tasleem (i22-1677)
FAST NUCES ISLAMABAD CAMPUS

Haya Vision
Haya Vision is an Al-powered Islamic content moderation platform built to enable Shariah-compliant digital
media consumption. It provides automated filtering of audio and visual content based on defined Islamic
standards, helping Muslims engage with online media while adhering to religious principles.
The system operates through two primary components.
On the static side, users can upload audio or video files or paste media links via a web or mobile interface.
HayaVision processes the content using advanced Al models to remove background music, filter explicit or
profane speech, detect and blur non-mah ram visuals, apply NSFW filtering, and perform context-aware
visual moderation(hijabi/non-hijabi). The output is a sanitized, Shariah-compliant version of the original
media.
On the dynamic side, a browser extension provides real-time visual filtering on platforms such as YouTube
and Google Images, automatically blurring immodest or inappropriate visuals during browsing while
preserving permissible content.
HayaVision is built on a modular, privacy-conscious Al architecture and is guided by documented
Shariah-compliant filtering standards with configurable strictness levels to accommodate jurisprudential
differences. The platform is designed for individuals, families, and institutions seeking reliable, faith-aligned
digital content moderation in a modern media landscape.
Keywords: Computer Vision, Audio Processing, Shariah-Compliant Al, Islamic Content Moderation,
Privacy-Preserving Systems.
1-1a!:::tav1s1oru Ku'
'-!I
Empowering Modesty in t:he Digital Age
Problem
• Increasing exposure to immodest visuals,
music, and explicit speech in digital media
• HayaVision enables Shariah-aligned media
filtering through S£atic ,media sanitization
and real-time visual bluffing.
Workflow
_.....,., ,Eis
Used:
1
Web/Mobile Upload Media/ @.,. )
Paste Link Server
App Su
Mr. Amir Guizar
Audio Processing
•C---
Group Members:
visUillll Proce-.ssi"1:
Processed
Output Muhammad Ahsan (i22 -0838)
ML Processing
Features
Malik Ali Awan (i22 - 1307)
• Dual-mode (Realtime + Static Pipeline)
• Multi-modal (Audio + Visual) Muhammad Hamza Nadeem (i22 -0779)
• Smart H ijab preservation
• Segmentation based filtering
• Customizable sensitivity levels
Tools and Technology
- -c',-l
Supervisor
Mr. M. Aamir Guizar
Group Members
Malik Ali Awan 22i-1307
M.Hamza Nadeem 221-0779
M.Ahsan 221-0838
FAST NUCES ISLAMABAD CAMPUS

VisionSnare: Deepfake Video Detection
VisionSnare is a deepfake detection framework designed to identify synthetically generated
videos by analyzing intrinsic generation artifacts left behind during the creation process.It utilizes
Neighboring Pixel Relationships (NPR) to capture universal spatial traces left by up-sampling
operations in generative models. To address the limitations of static spatial analysis, VisionSnare
extends this artifact analysis into the temporal domain to capture inter-frame inconsistencies
specific to video deepfakes.
Features include:
-Automated video preprocessing that includes motion-based smart frame sampling and
MTCNN-based face alignment.
-Extraction of Spatial N PR features using 2x2 grids to catch artifacts.
-Temporal NPR feature generation by comparing artifact pattern consistencies across consecutive
frames.
-A hybrid model utilizing a Convolutional Neural Network and Long Short-Term Memory
network.Furthermore an attention mechanism designed to assign higher importance score to
facial regions where forgery artifacts are most prominent.
-Clear result visualization(Real/Fake) along with probability confidence score
Key Words: Deepfake detection.Spatio-Temporal Analysis.Neighboring Pixel Relationships,CNN,LSTM
Supervisor:
Mr. Arslan Ast.am
Grnup MAmbnr-,:,:
rlza Jameel 221 0904
ShaharyQr Rl~wan 22i-OQQQ
MOu..L"-i.1111 Hal CC.! 221-l.093
VisionSnar-e
DEErFAKE VIDEO DETECTION FRAMEWORK
Oeepfakes manipulate reality,
Vi:::;.ionSnar~ r1:::::;.lort=~ u-u:::;.t
-9'T.Z"6 Ac.::u, ...L u. :z::..,,·o cu,·,·•p•·u ..... i:.v. Built. tu ,.,.,t,._1,
deeofakes the humc1n eve can't~
-Sm•rt•..-Than • Single Fr•me. Cu:5tom Rc:oNet: • L::3Tf"1 •
Attention - .:Jn.:il~c!:. t.Jccs.Jcro!:.~ time. not iu!.t 1n i~ol.Jt\on.
• Ar,y Vidcto In. R~L ar r"AKl:l Out. C:nd to ~nd dC''t~c:'tion
wlt.h confidence scoring, ready for the real VvOrld.
Our Approach
Technolo Used:
0,991 9C,8% Pytho n,Pytorch,Ope nCV,Scikit-lea rn
Su ervisor Name:
. - O·ur- T-lm-elln·e --- ·
Sep-Ocl Mr. Arslan Aslam
l:ltu•l"~• Motho<lolOIIJY MO<lol Tunin•&. T••t•n1 &
l111jJlc111c1 lJlklfl l111µlt:)llllllllJllU11 F!Olllelll.l DUY Ouµluy1111:111l Group Members:
Tech Stack Applications Shaharyar Rizwan(i22 -0999)
• Digit.:sl Forcncic::
• MPrii.::11 A111'hPn1"ir-.:a1'inn Moazzam Hafeez (i22 -1093)
• Social Media Platforms
• Security System s
Fiza Jameel (i22-0964)
FAST NUCES ISLAMABAD CAMPUS

LabGuard
LabGuard is a desktop Al proctoring system for lab-based exams, designed for instructors and
students in low-connectivity areas like Pakistan. It uses an offline-first hybrid setup, unlike cloudonly
tools like Proctorio.
Key Roles
Admin: Manages users and courses.
Teacher: Creates exams, sets app rules, reviews violations.
Student: Downloads exam package, takes monitored test.
Core Monitoring
OS-level: Tracks unauthorized apps, window switches, clipboard use.
Camera (YOLO/MediaPipe): Detects face presence, gaze, multiple faces, absences;
snapshots only on anomalies.
Anomaly scoring: Rule-based integrity scores with logs/screenshots.
Security & Features
2FA login (password + face-api.js embeddings).
Sandboxed code execution; LLM-generated test cases.
Encrypted local SQLite storage, post-exam TLS sync to PostgreSQL.
Auto PDF/CSV reports.
Keywords: Al Proctoring, OS Monitoring, Face Recognition, Offline-First, Academic Integrity.
~ ;·:s._'- LABCUARD
~ -1//'
i
Offline-Flrst Al Proctoring {
for Lab Exams ,,.,.;.,,,-
r:,-,.::i • ,oclel beha-.,lour · A.pp monllodng
slans detKtlon .._... dutin.t lab 8)(.ams
Architecture Design------~
Technology Used:
Electron, React, Nodejs, Python, Yolo, git,
Mediapipe, FaceApi,
, Visual Studio code
Tlmollne
Supervisor Name:
Mr. Shams Farooq
Group Members:
Saif ur Rehman (i22-0933)
~=
Haider Zia (i22 -1196)
,Ja !;.ii • Urnar kulm
Py,t\Ofl M.alaPipt- YOW • • H Sa • U ld u ., r R Zi e a h rn•n Umar lnam (i22 -1716)
FAST NUCES ISLAMABAD CAMPUS

CashFlow
CashFlow is an intelligent web platform designed to help investors make better stock decisions in
the Pakistan Stock Exchange (PSX). Instead of manually analyzing chruts, financial reports, and
news separately, the system brings everything together in one place and provides a clear Buy, Hold,
or Sell recommendation with explanation and confidence level.
Technically, the platform integrates three analytical engines: Fundamental ( Quruterly reports),
Technical ( historic price ) and Sentiment ( News from social media ), which are combined using a
weighted Fusion Engine to generate a unified investment signal and multi-horizon price tru·gets.
Features include:
• Selection of any stock from 25 pre-filtered PSX liquid stocks
• One-click execution of the Fusion Engine
• Detailed breakdown of Fundamental, Technical, and Sentiment analysis
• Display of final signal with confidence score and price tru·gets
• Integrated AI chatbot for stock-specific queries and signal explanations
How it works:
User selects stock~ System analyzes it from three perspectives~ Fusion Engine combines
results Dashboard shows recommendation Chatbot explains reasoning.
Keywords:
Machine Learning, Financial Forecasting, Sentiment Analysis, Fusion Model, Explainable AI
CASHFLOW
, Al-dri\len platform for Pakistan Sloe-. E•cliange
{PSX) a.tock anal~sls
• lntegrcites finc1ntia fi.mc;!amen~ls technic,.11
1no1cators, aoo rea111me market sermment.
• Produces di'lla-dnven Buy, Hold, or Sell
1n ... es1ment signals.
Technology Used:
Supabase, Nextjs/Reactjs, ollama, python,
MinerU, Qwen, hostinger
Fuson E11g rie
Dallilsel cdlltciion Fusion webap~ Supervisor Name:
Mr. Muhammad Aamir Guizar
Troinmg & Tc~liog
Group Members:
Muhammad Awais (i22 - 2390)
supabase Q,j MinerU @ React
Muhammad Sarmad (i22 - 1213)
Sup9rvl&or, Mr. Muhammad Mmlr Guitar
i222390, Muhc1ml'T\(ld Aw<Jis
Muhammad Abdullah (i22 -0820)
FAST NUCES ISLAMABAD CAMPUS

AgroGuard: Al-Powered Pest Detection and Management
Project Description: AgroGuard is an Al-based system designed to assist greenhouse owners by
monitoring pest activity and maintaining crop health in real time. It integrates computer vision
(YOLOv8), acoustic analysis (CRNN), and environmental sensing (DHT22) to identify pest
occurrences and correlate them with climate factors like temperature and humidity. The system
provides actionable insights via a web-based dashboard and an integrated Chabot to help reduce
pesticide misuse and support informed decision-making.
Key Features:
• Multi-Modal Detection: Identifies visible pests using YOLOv8 and sound-producing pests
using CRNN or YAM Net.
• Real-Time Web Dashboard: A desktop-based interface providing live detection feeds,
searchable history, and summary analytics.
• Smart Alert System: Sends real-time Firebase notifications for new or high-confidence
detections while preventing alert fatigue.
• AgroChatbot & Advisory: Offers conversational support and generates reports summarizing
pest history and treatment effectiveness.
Key Words: Al-Powered Pest Detection, YOLOv8, Acoustic Monitoring, Greenhouse Management,
Real-Time Dashboard
•
AgroGuard
Technology Used:
Revolutinating Crop Protection Ilia Real-time
Computer Vision
Languages/Frameworks: Python,
PyTorch, Flask, React, FastAPI
SYSTEM ARCHITECTURE 1 Al/ML: YOLOv8, EfficientNet,
·-:-_:_~- i -; -1~--:-, .I
CRNN, YAMNet
Cloud/DB: PostgreSQL, MongoDB,
Firebase FCM, Hugging Face
Inference API
Supervisor Name:
#tijil,»Sift
Ms. Noor-ul-Ain
Group Members:
Feb MM Apfil
Muhammad Omer (221-0921)
TECHNICAL STACK
ll<ETEAM, Muhammad Mouid Ali (221-1026)
D M e v w tu f m op u t d n d : l h ~ U ,.. ' . . _ in !1 l 1 N '1 d N Mda O ud m ~ tr n tJll'wt.dc:lt1,
!<Joffiisedby-MSNo«-u-Aln Muhammad Salahuddin (221-0969}
FAST NUCES ISLAMABAD CAMPUS

|     | VRMTS - | VR Medical Training System  |     |     |
| --- | ------- | --------------------------- | --- | --- |
VRMTS  (VR  Medical Training System)  is a hybrid Virtual Reality and Web-based medical  learning
platform designed to enhance anatomy education through immersive 3D interaction and Al-assisted
support. Traditional medical education heavily relies on static 2D diagrams and limited cadaver access,
restricting experiential learning. VRMTS addresses this gap by providing an affordable, interactive, and
adaptive virtual anatomy learning environment. The system consists of two integrated modules:
The VR Module, built in Unity using OpenXR and XR Interaction Toolkit, enables students to explore
anatomical models in immersive 3D,  attempt interactive quizzes, and receive real-time scoring and
progress tracking. The immersive environment enhances spatial understanding and hands-on learning.
The Web Module, developed using React and Three.js, allows users to visualize anatomical models in
3D  through a browser interface,  rotate and zoom structures for detailed examination, and access
assessment  tools  and  performance  dashboards  remotely,  ensuring  accessibility  beyond  the  VR
environment.
Built using the MERN stack, MySQL, Unity (OpenXR) with C#, and Python-based Al integration, the
system  ensures  secure,  scalable  backend  architecture  with  Al-assisted  medical  content support.
VRMTS aims to provide a scalable, accessible, and intelligent medical training solution that improves
engagement, conceptual clarity, and learning outcomes for medical students.
~ MEDICAL
|     |     |     | Technolo  | Used:  |
| --- | --- | --- | --------- | ------ |
'lRMTS  TRAINING SYSTEM
VR:
Unity, UnityWebRequest, JsonUtility, XR
Interaction Toolkit, Standalone Quest Deployment
Web:
React, Three.js, Node.js, Express
Al:
RAG Pipeline, FAISS Vector Search, Ollama LLM
Backend:
REST APls, JWT, MySQL, C#, PHP
Device Testing:
TIMELINE  Meta Quest 2/3, Desktop Browsers
AUO-OCT
Supervisor Name:
MARCH-.JUN
.
Dr. Arshad Islam
| Re a ! i'i @ a r c h  &        | M V P   &  f u r th e r  | i              |       |           |
| ------------------------------ | ------------------------ | -------------- | ----- | --------- |
| P l ~ n n i n g   Core System  | i nt e g r a ti o ns     |                |       |           |
| Development                    |                          | T~sti.ng       |       |           |
|                                |                          | Opt1m1:cat1on  | Grou  |           |
| TOOLS                          |                          |                |       | Members:  |
~ Unity(310 @) cffl>r' S\  TEAM MEMBERS  Tauha lmran (i22-1239)
Suporvisor; C!-". Arst.ad Imm
| O O M e t a        | Cn,!t;11r,NV1vir,n,_ N,.,......,t,,, ~..,,.,.  |     |                         |     |
| ------------------ | ---------------------------------------------- | --- | ----------------------- | --- |
|                    | thru6M yS Q L                                  |     | Dania Qasim (i22-0462)  |     |
| C : ::,  oc u lu s |   XA lvP P   Da1'ia o-im Ci22•0462)            |     |                         |     |
AIHerJ;r..,•d(lJ:2.-Ml-'llll
|     | l"'IOllama  |     | Abeer Jawad  | i22-1041  |
| --- | ----------- | --- | ------------ | --------- |
-

FAST NUCES ISLAMABAD CAMPUS

GI DIAGNOSIS
A real-time diagnostic app is being made, keeping the perspective of doctors and medical
researchers in mind. As a research-based project, we experimented with various deep learning
models and ultimately used a hybrid architecture combining EfficientNet for extracting local
details and a Vision Transformer (ViT) for capturing the global context. To ensure fast
performance, we applied Token Merging and a fusion strategy. There are two views of this app -
Classification View and lnterpretability View - the former is for medical professionals to input
standard endoscopy images and instantly classify them into 8 gastrointestinal disease categories.
The latter generates Grad-CAM heatmaps to visually highlight the exact physical boundaries of the
detected disease to ensure clinical trust.
Features include:
• Real-time classification of 8 different gastrointestinal diseases and lesions.
• Grad-CAM heatmap generation to highlight the exact location of the disease.
• A hybrid deep learning model combining EfficientNet and ViT.
• Fast processing and inference using Token Merging and feature fusion.
• A heavily tested framework evaluated against multiple baseline models.
Key Words: Hybrid Deep Learning, Vision Transformer (ViT), Feature Fusion, Gastrointestinal
Diagnosis, Heatmap Generation
,. ... " . ,--•-«
GI DIAGN@ SIS
OBJECTIVE
An efficie-nt diagnostic application that classifres
gastrointestinal dis.eases And lesinn~ using a ,..ovel
hybnd Vtl architecture alongside advanced fusion
and optimization technlaues.
MODEL ARCHITECTURE
tnpul & lnhancem•nt
Cndmcopy rremH •>
GA Opt.>n,l.tM Cl.AME
rar.,g•t&d Augm&nt3lion
Shift. Sc•~• R . o . t . et . c . r ff) Sh<tt,SC;ale, ROH'4'. fl p Technology Used:
._I,.:-......
.....-, --~ Ou•I-Branch Extractlcn Python, PyTorch, timm (PyTorch Image Models),
..... LoaJ-ENcientNtlt•BO I
Global ViT ...,, rou,, MMOil'\9
OpenCV, Scikit-Learn
LHrnabte Gated Fusion
C>ynemk !.t9motd C.t• Supervisor Name:
Disease Cla.sslflcatlon Dr Nauman Noor
P1obalbd,ty outpu1s for
8 Cl ct.t<Ms
Group Members:
Shah Abdullah (i22 - 0842)
Muhammad Moiz (i22 -0617)
TOOLS AND TECHNIQUE
Asim Iqbal (i22 - 0787)
e,'.l, • e
6 PyTorch '-in O
l)p9n(:V nv1DIA
FAST NUCES ISLAMABAD CAMPUS

Questor
Questor framework is being made, whilst keeping the perspective of financial auditors and
regulators. There is a single, unified view of this application for the auditors to use the features
provided by our framework to analyze 10-K filings, detect numerical anomalies, flag linguistic red
flags, and generate explainable fraud risk scores. Grounded in rigorous academic research, the
system's effectiveness is validated through extensive testing on SEC EDGAR filings, proving its high
predictive power and superiority over traditional rule-based manual audits in identifying complex
manipulation schemes.
Features include:
• Dual-pipeline analysis integrating structured numerical data and unstructured textual
disclosures.
• Detection of financial anomalies using Machine Learning and Benford's Law.
• Contextual NLP analysis to identify linguistic deception and sentiment masking.
• Multi-agent system utilizing dynamic weight adjustment for final risk score aggregation.
• Explainable Al reports providing clear, auditable evidence for regulatory compliance.
Key Words: Artificial Intelligence, Financial Fraud Detection, Natural Language Processing, Machine
Learning, Multi-Agent System.
T_.._..,ban
Jlt,,,t.,,""1,~-(iD'''"''l
,._,...,.Mef>fltlll11li!I~
h~.o..-,ltll07(;t)
QUESTOR
A Hytlfld Gri'l5'.l'1 Le-a•ning .ind Agentic ~ saning
Framewort rot F oand:il Fraud Detecion
aGi,-~
The Problem {fP
• • $ 11 4 ·d .5 d T ff n l l r l i o ~ n u1 ,e 1 n 1 r u ,,, n 1, a !1 ti lg u k c lb lu o ! ' P f d ra l u u dl i « { i J o O 5 . ~ K flhr¥}. ( q @ '- J A " , ' • -
• -,11dh:1011tll ut1111r111 .:nd """"•C:JI~
Our Innovation
• °""'.....,.""" Ar....,,._.:
C9r••l~t•H •t•l'<t11ritQ ~14' w,11, w.:~fll
sentln~nt.
• ..... • • ,.,....,.,,LLM-bftt<ed(<>nt<lidu.11 merp,•~
• Grtph L<t11nln9= E,QJows hl<!doo entily ,c ®onships.
Fraud Analysis Workflow Q Technology Used:
Python, Anaconda, PyTorch, FinBERT, GPT-3.5-
turbo, spaCy, BeautifulSoup, sentence-
transformers, ChromaDB, Neo4j
Supervisor Name:
Dr. Basharat Hussain
Group Members:
Abdullah Shakir (i22 -1138)
Technologies Used Muhammad Sibtain (i22 -0887)
m 0 l P 'Y V O -G io , n , , E J J e-uliil"'So~ t > J " Fi ' n - l ' ~ I , ltra Aqeel (i21-0769)
GPl-3 5 TIMbO W Cl,,0<1!1DI
FAST NUCES ISLAMABAD CAMPUS

|     | MARS - |     | Multi-Agent Requirements Engineering System  |     |
| --- | ------ | --- | -------------------------------------------- | --- |
MARS  is  an  Al-powered  Requirements  Engineering system  designed to assist  stakeholders  in
producing clear,  structured, and high-quality software requirements. The system addresses key
challenges  in  requirements  engineering,  such  as  ambiguity,  duplication,  and  conflicting
requirements, by embedding automated quality assurance directly into the requirements phase.
MARS operates through a modular, multi-agent architecture where requirements pass through
progressive stages of elicitation, validation, refinement, and documentation. A chatbot interface
enables interactive requirement gathering, asking context-aware questions, clarifying questions,
and organizing inputs into structured formats. The system automatically detects duplicate and
conflicting requirements using semantic similarity models, ensures atomicity, and refines vague
statements. Validated requirements are categorized into functional and non-functional types and
transformed into agile user stories with titles, descriptions, and acceptance criteria. Finally, MARS
generates an editable, IEEE-compliant Software Requirements Specification (SRS} document. By
integrating  all  these  steps  within  a  single  intelligent  framework,  MARS  streamlines  the
requirements lifecycle and enhances overall project reliability and efficiency.
| .,....,  |      |     | MARS  |     |
| -------- | ---- | --- | ----- | --- |
| {<1Jnj   | I .  |     | •  .  | .   |
'-,,.- Mu ti-Agent Requirement Engmeermg
Turn Product Ideas Into Complete SRS Documents Automatlcally
• JntcUigcnt Elicitation
• Detects conflicts & duplicates
with 88" precision
• Classifies FRs fY NFR.s with
90"-t-accuracy
• Gcncratca standardized SRS &
dcYdoper-rcady UKr &torica
Process Flow
Technology Used:
|     | @ ~  |     |     |     |
| --- | ---- | --- | --- | --- |
Python, Multi-Agentic System, Fast API, React,
Hugging Face, Pydantic, MongoDB, RabbitMQ
Su  ervisor Name:
Dr. Arshad Islam
Project
| Timeline  |     | •   |     |     |
| --------- | --- | --- | --- | --- |
Group Members:
|     |     |     | Hov·Oec  J•n•Feb  | Mar-1\pf  |
| --- | --- | --- | ----------------- | --------- |
eonnk't f!I Duplit'ILI  Sep-Oct  Arrij Fawwad (i22 -0755}
|     |                         |     | rR,\'FRO.-lkaion.  ~RSl)onuMr,t             | R,qi_1IN'"TWl'II        |
| --- | ----------------------- | --- | ------------------------------------------- | ----------------------- |
|     | Dtt,rilonMDMI           |     | Al.omk' Chttk.  Ma.na,,,rnwnt. EJilw l!i    | Elicfa,tio.o.' f,m.ing  |
|     | o-.lopmn,tf'!Tn..ainr;  |     | Raf'i:nn!»lll-'J;;n,I  l:Mr !WW, Cn.rala:m  | (! \1,Scl.tion          |
Hamna Arshad (i22 - 1098}
Tools & Technologiea
Dr. Anh.ad Islam
| £e  | - t | r'  | 0 ~  | Co-lu~  |
| --- | --- | --- | ---- | ------- |
Zubair Khalid (i22 -2475}
Mr. t:s.oma 1mtl112.
|     |     | 0   | &   | G r o u p  M e m b e r s                  |
| --- | --- | --- | --- | ----------------------------------------- |
|     |     |     | 0   | A r r i j f 'a W' ¥t ..a d  2 2 1 ..o;ss  |
llamna Anhad 221-1098
Zub~r Khalid 221-2-175

FAST NUCES ISLAMABAD CAMPUS

Suraiyya
The purpose of this project is to create a productivity application tailored to the needs
of neurodivergent adults. The system will combine several productivity and wellness
features into a single web application, reducing the need for users to switch between
multiple apps. Since much of real work and study happens on computers, this focus makes
the app suitable for offices, universities, and other professional or academic environments,
where phones can often become a source of distraction rather than support.
Features include:
- Productivity-focused chat bot
- Mood tracking
- Focus sessions,
- Body doubling
- Idea and Task management
-Gamified self-care
Key Words: (Add 5 Key words i.e technologies/themes reflecting your study)
Al, Mental Health, Web Programming, Python, Neurodivergence
Technology Used:
React, NodeJS, Express, MongoDB, Python,
Javascript
Supervisor Name:
Ms. Sana Razzaq
Group Members:
Ahmed Murtaza Malik (i22 -0985)
Rehal Saeed (i22 - 1071)
Samra Mashaam (i22 -0757)
FAST NUCES ISLAMABAD CAMPUS

PawPal
PawPal - A Pet Care Mobile App is being developed with the perspectives of pet owners,
veterinarians, and pet caregivers. Pet owners can use features such as pet breed identification,
Al-powered veterinary guidance, personalized diet and care plans, pet health journals, community,
lost & found pet, marketplace, vet appointment booking, and caregiver services. Veterinarians can
provide medical services to pet owners. Caregivers can be hired for pet care and grooming.
Features include:
-Al-based pet breed identification.
-Al-powered chatbot providing 24/7 veterinary guidance and personalized diet plan generation.
- Pet profiles and digital health journals, including activity logs and care records.
-Secure pet toy marketplace with seller/buyer profiles and transaction histories.
-Community hub, media sharing, lost & found, adoption, and event/meetup planning.
-Veterinary services integration, including vet appointment booking and nearby vet location.
- Pet caregiver services with profile verification, booking, and GPS tracking of pet walks and sitters.
- Payment integration supporting Stripe and cryptocurrency wallets.
-Sending query/feedback to the admin panel in case of failure of any service or module.
-Admin dashboard for moderation, reporting, and escalated query management.
Key Words: Flutter, RAG-based Chatbot, CNN Breed Detection, Pet Care Ecosystem, Cross-Platform
Mobile Application
-v-
Supervisor
|     |     |      | rvts. Amna. I rum  |     | '-.....__,,..!,.,.'"  |     |     |
| --- | --- | ---- | ------------------ | --- | --------------------- | --- | --- |
| Pa  | vvP | a l  | Team l'Vle         |     | m  bers               |     |     |
•  Huzalf'a Nasll·
| F25-10:L-D-PavvPal  |     |     |     | i::>?, 053@nu.odu.pk  |     |     |     |
| ------------------- | --- | --- | --- | --------------------- | --- | --- | --- |
- Hom~a Nav,eed
| Everything you need t:o care  |     |     |     | i22086:L@nu.edu.pk  |     |     |     |
| ----------------------------- | --- | --- | --- | ------------------- | --- | --- | --- |
| for your pet In one place     |     |     | -   | Moo;r Ali           |     |     |     |
l22104-2@nu.edu.pk
Ov-ar-v,iovv
PavvPa.l is a comprehensive n"'lobile applicat:.ion design,ed
t:o revolutionize pet: ca.re by int.egrat.ing health
m o,roogomor,t. comm unity c ngogomont, and i.---.tolligont Al- Technology Used:
| povvered services lnt:o a  |     | untried pta·rrorm.  |     |     |     |     |     |
| -------------------------- | --- | ------------------- | --- | --- | --- | --- | --- |
Features  Flutter, Galang, PostgresSQL, Python, Git,
React , Flgma , Docker
Supervisor Name:
Ms. Amna lruma
"'""1,...,,·.-.u,y
communlt:y
|                  |                  | -             |                        |           | -                     |                      |        |
| ---------------- | ---------------- | ------------- | ---------------------- | --------- | --------------------- | -------------------- | ------ |
| T ime line       |                  |               |                        |           |                       | Group Members:       |        |
| .,__......       | Iteration 2      |               |                        |           |                       | Huzaifa Nasir (i22 - | 1053)  |
|                  |                  |               |                        |           | lt:oro.tlon 4  --.    |                      |        |
| Iteration        | 1  - Chat.bot:.  |               | ltoro:t:lon 3          |           | •  Event:             |                      |        |
| - lntltal UI/UX  | Sy:1.tem         |               | •  Communlt:y Hub      |           | Planner               |                      |        |
| •  O r c o d     | •   V e          | t  B o ok i n | g  •   LO :S t :  &  F | o u n d   | •  C a r e   G iv er  |                      |        |
lci o n u n cot:lon  - O ie t  &  C a r e  •  M o r k o t;  p ln c o   S o r v f c o s  Hamza Naveed (i22 -0961)
|     |     |     | •  Admi,.... Panel  |     | •  Admln  |     |     |
| --- | --- | --- | ------------------- | --- | --------- | --- | --- |
Concr-ols
| Tools and Techn |       | o logy u | sed:  |     |      | Maaz Ali (i22 - | 1042)  |
| --------------- | ----- | -------- | ----- | --- | ---- | --------------- | ------ |
| - GC>           | 4'-.  |          |       |     | ...  |                 |        |

FAST NUCES ISLAMABAD CAMPUS

|     | Markly - | Al-Powered Marketing Automation System  |     |     |
| --- | -------- | --------------------------------------- | --- | --- |
Markly is an Al-driven marketing automation system designed for small and medium businesses.
The platform automates digital marketing through multiple Al agents that perform market research,
strategy generation, content creation, scheduling, and performance analysis. It allows business
owners or marketing staff to analyze competitors, generate strategies, create promotional content,
and manage campaigns from a single platform.
Markly provides an intelligent marketing workspace where users enter business details and receive
competitor insights, campaign strategies, and ready-to-publish social media content. Markly
automatically schedules and publishes posts on Meta platforms, while analyzing engagement
metrics. Using this, it recommends improvements for more effective campaigns.
Features include:
•  Al-driven competitor and market analysis
•  Automated marketing strategy generation with campaign planning and content calendars
•  Al-based generation of social media captions and visual marketing assets
•  Automated scheduling and publishing of posts via social media APls
Key Words: Agentic Al, Computer Vision, Generative Al, Image Processing, API Orchestration
'-""
| MARKLV:  |     |     | \~ j...   |     |
| -------- | --- | --- | --------- | --- |
rs4Markly
| Autonomous        |     |     | '-m•<"'     |     |
| ----------------- | --- | --- | ----------- | --- |
| Marketing system  |     |     | Supervisor  |     |
Ms. Soiro Qamor
Group Members
Mohod Rehman I 22i-0792
M. Hashim A'A'On I 22i-0976
M. Masob Hammad I 221-1004
Markly is on Al-pov.,.orod marketing platform that holps small businesses
run complete digltal campaigns w,th ease Its multi-agent system
monoges research. strategy, content creation. automated pasung. arid
performance optJmizat,on ocross SOCICll med10 -all ,none place.
Technology Used:
LangChain, LangGraph, Yolov8, OpenCV,
FastAPI, Supabase, React,js, Meta APls, Docker
Supervisor Name:
|                         | TION:i 0,Tt. . T'°"i•l  |                    | ~ TU<~ION<:      | Ms. Saira Qamar  |
| ----------------------- | ----------------------- | ------------------ | ---------------- | ---------------- |
| FO\.NDA1 lON  ""~'°"~•  | ~TAi O<lV. E.lO PMfHT   | CONTENT ,          | D(P\.OYMENT &    |                  |
| ill.lllOi:NG            |                         | INT£GUTION         | OPllMIZATlON     | Group Members:   |
| • 0uw~..-.,             | •                       |                    |                  |                  |
|                         | M.  t,u,w,y             | •                  | • 1,1111,'1(4,   |                  |
| Fi:,elrt                | •s•ot96-                | COtlttntlf'Ofl,ng  | Plfl'OnTIO!'ICI  |                  |
•Ootabow  S-«90k~  ., ...  t~  Muhammad Masab Hammad (i22 -1004)
| ~Oil>M  | •~  | MlfO'ntlnn  | •~I.UAT  |     |
| ------- | --- | ----------- | -------- | --- |
Muhammad Hashim Awan (i22 -0976}
|     | NO\I-D¤C  | JaN-,EA  | MAR-APII                                  |     |
| --- | --------- | -------- | ----------------------------------------- | --- |
|     |           |          | !t,Q .  Mahad Rehman Durrani (i22 -0792}  |     |
<ffl, oo ll CDm
V voLOv8

FAST NUCES ISLAMABAD CAMPUS

F25-108-D-UmrahMate: Intention to Completion Simulator
UmrahMate: Intention to Completion Simulator is a Virtual Reality-based Umrah training,
evaluation, navigations, and sacred object teaching system developed using Unity3D, Blender,
Visual Studio Code, Meta Horizon Link, Meta Quest Developer Hub, OpenXR, C#, and the Unity XR
Interaction Toolkit. The system provides immersive training through realistic 3D models of Masjid
al-Haram, step-by-step audio guidance, visual do's and don'ts, Gates, Wheelchairs, Washrooms,
Ablution Areas locations and multilingual support to help pilgrims learn Umrah rituals, relevant
Qur'anic verses, Hadiths, and sacred object information, while also enabling facility navigation.
Key features include Tawaf count tracking, ritual logic validation, gender-specific rules, and
evaluation modules to ensure correct learning according to Islamic guidelines.
Performance is optimized using frustum and occlusion culling, GPU instancing, batchings, and
texture compression.
The outcome is an accessible, realistic, and scalable training and guidance solution that enhances
user understanding, confidence, and correctness before performing Um rah in real life, helping users
avoid mistakes that may require dam (sacrifice) as a penalty, while providing a time-efficient, cost-
efficient, and management-efficient approach to structured Umrah preparation, sacred learning,
and facility navigation.
Umra/J Training, Umra/J Evaluation, Facility Navigation and
Sacred Teachings in Virtual Reality.
Umra (U h s P e i r lg / inn Tawaaf Sa'/
Technology Used:
C#, Unity3D, Blender, Metaverse, XR,
Meta Horizon Link,
Meta Quest Developer Hub, Visual Studio Code
Supervisor Name:
Ms. Urooj Ghani
Group Members:
Muhammad Ta Iha (i22 -0839)
Group Members Supervisor
M. Ta/ha 221-0839 M U . Gh . Muhammad Raza (i22 -1234)
M. Raza 221-1234 S. fOOJ an,
FAST NUCES ISLAMABAD CAMPUS

VFXGen: Advanced Object Replacement Integration
VFXGen  is a professional-grade Al visual effects platform that automates the complex process of
object replacement and integration in video footage. Built on a React and Django REST Framework
architecture and powered by Google Cloud Platform, the tool utilises a hybrid approach where
users  provide  high-level  prompts and masks, which are then processed through a multi-stage
pipeline. This pipeline leverages COLMAP for camera tracking, HunyuanD3 for 3D asset generation,
and  XMem  for temporal  mask  propagation,  all while ensuring visual fidelity through a novel
semantic  anchoring  technique  that  maintains  temporal  consistency  and  eliminates flickering
across  frames.  The  outcome  is  a scalable, cloud-native solution that allows artists to achieve
realistic object insertions, complete with lighting and shadow refinement, without the prohibitive
manual effort of traditional rotoscoping and 3D tracking.
Features include:
•  Hybrid  Al-Powered  VFX  Platform:  Combines  mask-based  precision  control  with
prompt-based creative flexibility for professional video effects generation.
•  Multi-User Collaboration: Supports shared projects with granular role-based permissions,
including Owner, Editor, Viewer, and Manager roles.
•  Temporal Consistency Framework: Utilises a novel approach to ensure visual coherence
and eliminate flickering across video frames.
Key Words: Generative Al, Video lnpainting, Temporal Consistency, Computer Vision, Visual Effects
(VFX).
@:';:::::'w':.-.:.'::...-u
| V F X G e n  | :  A d v a n c e d              |  O b ie c t     | .. ~.. - _ ... . .. , .., . .. . ._ _ . . , _ ~. ...~  ~"_ - '" - ,'.   |
| ------------ | ------------------------------- | --------------- | ----------------------------------------------------------------------- |
| Re p l a c e | m e n t  a n d   In             | te g ra t i on  | . _                                                                     |
|              | *   : : . : : : : : - - -       | · · - -         |                                                                         |
|              | •  : - -. .. .. : :- = . ,g . ~ | o g r- n,g      | .                                                                       |
| X            |                                 |                 | 0  -- . .  0l  .l.. .,:   l.o.l.;..,. ,...._.,                          |
- . !tll h ;f. .
|     | &(:,..-,,&o_,__,,,..,.._  |     | ...,. ... ..,_  |
| --- | ------------------------- | --- | --------------- |
;:=...-
-
SY$TlM ARCHITICT\JRE AND PIPEUNE
|     | Gb  |     | B   |
| --- | --- | --- | --- |
•
0
|     | -,.-,,_ . . , _ _ _  ' ""   | ~ .. i. .,1 - -           |     |
| --- | --------------------------- | ------------------------- | --- |
|     | . .  ~ · - ·· - ~ --        | ----·- ·- - - - · ··~~-·  |     |
.........
Technology Used:
| C O R IE C A P A I II              | L I T I- H   -           |     | -           |
| ---------------------------------- | ------------------------ | --- | ----------- |
| - - - w _ - _ ~ , _ .,.  . _ . . . | . _ ..  _ _   _ _  ---·  | - - | · - · · - - |
. . .  ....-"..-..¥..."..~ ~  ___  ,., ..... ·-~-~·   Python, PostgreSQL, Redis, OpenCV, Google
| ,. ,  | , . |     | - - - · - --~. -.,-._-_-._~  . - ~-··  |
| ----- | --- | --- | -------------------------------------- |
._, _ .  , ,. ._, ...;..0 ,.,,,,_.-"'( ,-,...._--."-!<•>•"4'"-"',,•..., ..,_,  .~_ ..,,., _,,___ _;y_  . .. ,.._,..,.., '.(..1.,>_"..", ')_1"'_  •- -. ,. .•.•., I .,N ,.. ..., l.. "  ._ l  '   Cloud Platform (Cloud Run, Cloud Storage),
| .. . 0 |     |     | I 'l l.flt_<   l_r\",O. ..<_ to,.O.. .-, ~,.,•~•-  |
| ------ | --- | --- | -------------------------------------------------- |
Google Gemini Al, COLMAP, HunyuanD3,
XMem.
I·•·,·--·---·---·-- Supervisor Name:
I--~-~-~--~-
|     |     | 1-,.. ..-  --.. --....·  | --  |
| --- | --- | ------------------------ | --- |
1 . .- - - " • - - o o - . .   Dr. Muhammad Arshad Islam (Co-Supervised by Ms.
| 1l .~..0...C...l _ld<.l.o, .,.c. _. ... ,_---.-,.'."_"'- - |     |                       | loi<f><. .J.· • "'11.•1              |
| ---------------------------------------------------------- | --- | --------------------- | ------------------------------------ |
|                                                            |     | 1. . -. .. .. . - IIC | l. ... ...,. _JI O ( < Marium Hida)  |
TOOlS ANO Tt:CMNOLOGIH  Group Members:
| 0   |     | "   | "'  |
| --- | --- | --- | --- |
Abdullah Zubair Ghouri (221-1077)
Saffi Muhammad Hashir (221-1293))
Hamza Ahmed Siddiqui (221-1339)

FAST NUCES ISLAMABAD CAMPUS

GitCortex
GitCortex is an Al-powered developer assistance application designed for software developers,
testers, and project managers. It automates and enhances the GitHub-based code review and issue
management workflow. The system provides two main views: Developer View and
Admin/Management View. Developers interact through GitHub pull requests and issues, receiving
automated feedback on bugs, security vulnerabilities, code style violations, issue classification, and
prioritization. GitCortex generates context-aware inline comments directly on GitHub in natural
language to assist issue resolution. Administrators can monitor repository health, validate fixes, and
manage issue priorities through the Admin View.
Features include:
Code review related analysis including automated bug detection, security vulnerability
identification, code style checking, and logical error detection.
Real-time analysis of GitHub pull requests and issues using webhooks.
Issue classification and prioritization based on severity and impact.
In line code comments generated directly on GitHub for developer guidance.
System knowledge updated after admin validation and feedback.
Key Words: Artificial Intelligence, Large Language Models, Automated Code Review, Natural Language
Processing (NLP), Multi-Agent Systems
Gitcortex
Intelligent Al-Driven Code Review and Issue Management for
GltHub
• Architecture
Technology Used:
.Tlmellne
Python, React.js, GitHub REST API, MongoDB,
Gtt.Hub OA11th "ltet,rilt•OO\.
..... bhool ~tlllf). poA1 feQIASI S...111',' n,1,_.•bil.1ty & LLMs, NLP, Webhooks, Modal, Visual Studio
,_,,1n0,.andb"1dtel:Kl..on ,t\l,t\,fCOf'\-lt,tn,;i•tt.on l',t\MOl)l>m•ilt>O. .
cw.,.coi,_ ... , .-11-t~ ....r ;,l-t•tJ~ &ev.olu;Ulal\.
Code, Hugging Face, Kaggle, Google Colab
Supervisor Name:
Ms. Saira Qamar
IH-du,lfottt.o"M'ld D.lu~r,tolRl. .l
P,10<,\L<""-Ol'I l9"M b..okd dohbo.,,:1. iod"IIII
il!liolYSli. illld tool d,tyt\o,pment. style vi>hd.il,on.,oo~il Group Members:
M!eellon du1Uln11~tl>'I perfor.,.,_,.,nJna
1"'flle..,,11t1tlon.
Muhammad Umer Khan (i22 -0780)
.Tools • Team Members )
Mohammad Hamza lmran (i22 -0865)
i22-0780 Muhammad Umer KhOn
i22·0866 Mohammad Homza lmran
122-\021 Abdul Munhlm Hussain Abdul Munhim Hussain (i22 -1021)
Supervisor.
Ms. Soiro Qomor
FAST NUCES ISLAMABAD CAMPUS

Al/ML-Based Intelligent Monitoring Extension for Zabbix
This project presents the design and implementation of a standalone Artificial Intelligence and
Machine Learning-based monitoring extension that enhances traditional infrastructure monitoring
systems such as Zabbix without modifying their core source code.
The system operates as an independent analytics engine that consumes infrastructure metrics
(server metrics and network flow data), performs intelligent anomaly detection and forecasting,
and generates actionable alerts. The extension is designed to integrate with Zabbix via its API, while
also operating independently as a self-contained anomaly-detection system.
Unlike  traditional  monitoring  systems  that  rely  on  static  thresholds,  this  project  leverages
advanced ML models to learn system behavior patterns and detect complex anomalies, including
resource saturation, memory leaks, abnormal traffic spikes, DDoS activity, and unusual protocol
activity.
The architecture ensures that no changes are made to Zabbix's source code. Instead, the system
communicates through APls or exported metric streams, making it modular, maintainable, and
deployable in real-world enterprise environments.
Features include:
•  Standalone Al-based anomaly detection engine
•  Compatible with Zabbix via API (no source modification)
•  Predictive forecasting of server metrics
•  Detection of CPU, disk, and memory anomalies
•  Network flow anomaly detection (DDoS, abnormal traffic behavior)
•  Offline model training and evaluation pipeline
•  Model persistence for production deployment
•  Threshold-free intelligent alerting
•  Scalable modular architecture
Key Words: Artificial Intelligence, Machine Learning, Anomaly Detection, Network Monitoring,
Predictive Analytics
- - - - • _
· - - - ... ~ ··   . · . -   - -
. .. .   . . .
-.. .· . ·.. ~. ..- . ., . .  .  ( . . . 4 .   '. .. ~ ..... , ... , ..   r . , .\. )
| 1ntfOOuc••  | •n Al•Or ,...,.. 1nt•111-:,•.,c• 1•:,,,.•  |     | vno.r•t•na•  |     |     |
| ----------- | ------------------------------------------ | --- | ------------ | --- | --- |
tri•t
| l..,,f,ii~trUCLu,w Wll'"v o, .ot-.d ll<H <.li.:>•L-~ .... r1u, ...... o,. 1. .t .v ..,  ... 1. . .,  ,o,e,,;,,,, t~,'(M:,, ""t, Z<.>l.)oVI,.,  |                            | ,.,., •• r._.,.,,,;. ,,;..~, th<.· ,......,, tv1!0,1,.,                                |                                                                     |     |     |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | --- | --- |
|                                                                                                                                                |                            | It                                                                                     | ;,,.,_,                                                             |     |     |
| P • < :l •t :l                                                                                                                                 | iv e   l n r ,- , ,c v v d | ,; o ;1 w .1 " . " • ~ ~  '""• 1 • -   , . , , u .   ,. l  . a  9e,r.c,.e,.  . ,. op•• | " • ' < °" ;o '" , b ., l • lr • ,  , 1  .   ... ~ ... , • •   • •  |     |     |
: :l • ~ l d o " • · ra .d u c c • d   e + .   Technology Used:
'WOQKS:LO'W
Python 3.11, PyTorch, Scikit-learn, XGBoost,
Pandas & NumPy, Zabbix API (JSON-RPC
integration capability), Matplotlib
|     |                 |                   | M- .                      |     |     |
| --- | --------------- | ----------------- | ------------------------- | --- | --- |
|     | -•-O-•-U.oI na  | • n o m • \, '    | .._  u,r,a  ~ . , . . ,   |     |     |
|     |                 | 0 - .c 1 .l o n   | . ,_ . i, ..              |     |     |
Supervisor Name:
Dr. Hina Ayaz
TIMl!LINII!
| •                | -     | • -             | • - •                |     |     |
| ---------------- | ----- | --------------- | -------------------- | --- | --- |
| SI'..'  1.)(..1  | N~)V  | IJI~(  J,t\.,'- | fEB  I\Lc\X.  I\I'R  |     |     |
Group Members:
| ,-,O,._f,'l.l_l.,o,..h-t,'\-Qu !..ertu•O   | Oi"t"a "C''--nU.g•1••..-,.1,..,... Q  | r,,...A,,,l. .M..,O,,.C..H,,.I, ..,I\  |     |     |     |
| ------------------------------------------ | ------------------------------------- | -------------------------------------- | --- | --- | --- |
i:-.,;1...::. ..u • . ..,
| TOO~ & TlliiCH Ul:liiiD  |     |     |     | Aashir Ha meed (i22 - | 0920)  |
| ------------------------ | --- | --- | --- | --------------------- | ------ |
|                          |     |     |     | Azfar Bilal (i22 -    | 0950)  |
|                          |     |     |     | Maria Zahid (i22 -    | 1033)  |

FAST NUCES ISLAMABAD CAMPUS

Proof Play
A research-based Web3 gaming anti-cheat system that ensures fair gameplay using a hybrid architecture
combining Machine Learning, Zero-Knowledge Proofs (ZKP), and Blockchain validation.
The system detects bot automation, front-running, and gas manipulation in real-time while preserving
player privacy. It provides cryptographic proof of cheating detection without revealing raw gameplay data.
The system consists of three layers:
• Client-Side ML Layer - XGBoost detects suspicious behavioral patterns in real-time.
• ZKP Verification Layer - Generates privacy-preserving proofs of detected anomalies.
• Blockchain Enforcement Layer - Smart contracts verify proofs and update Soulbound Token-based
reputation.
Features include:
• Hybrid 3-layer architecture
• Real-time behavioral detection
• ZKP-based privacy-preserving verification
• On-chain smart contract validation
• Persistent SBT reputation system
• Dual detection (Gameplay + Blockchain monitoring)
Key Words: Web3 Gaming, Zero-Knowledge Proofs, XGBoost, Blockchain Security, Soulbound Tokens
_P_ro_o_f P_laH yp ,. .
MfoCflllllo.lldllrlUlll!tDIP
Modvat:lon
!loc;•ctwo, • f .,,,.._,rorw--tir,,ir,gattK~a.•rKI
.,,i,, rig ~·, ,_ I"'-o't9n _o,ni. . pnVK'I,
t,,Qll'#"~ll'--lcirllr_,S!Nf•rtl.Pf'l'KY,P-•~-...n
1•--lcb""'-'t>3itam"!I
Archlt«:lure
Technology Used:
Ethereum, Solidity, Hardhat, React, Node.js, XGBoost, Metamask, VS
Code, Groth16, Snarkjs, Circom
Supervisor Name:
Dr. Subhan Ullah
Group Members:
Maryam Masood (i22-1169)
Shahzaib (i22-1327)
Timltllne Appl!cotione
.• e _e ..• .... ,• •
·---- .,:_- A-•••- Hafiza lqra (i22-1269)
,_-,·_ ,.,, <,.: ·__-_ ·
,.
-
_
-
FAST NUCES ISLAMABAD CAMPUS

WatchT ower
WatchTower is an intelligent video surveillance system designed for security-conscious
environments like campuses and offices. Built as a modular, multi-process pipeline, it uses YOL026
for real-time human and weapon detection. The system tracks individuals via ByteTrack, generates
categorized alerts, and records H.264 video with motion-adaptive retention. Natural Language
based clip retrieva I.
Features
• Real-time Detection: YOLO26-powered human and weapon detection.
• Persistent Tracking: Multi-object tracking using ByteT rack.
• Smart Alerts: Automated entry/exit and weapon notifications with snapshots.
• Adaptive Storage: Automated video retention and cleanup based on event priority.
• Incident Review: Event-driven clip extraction using FFmpeg.
• Live Streaming: WebSocket-based video delivery to browser dashboards.
• Centralized Control: Unified Orchestrator for streamlined pipeline management.
• Semantic Search: Natural-language footage querying.
Keywords: Computer Vision, Real-time Object Detection, Video Surveillance, Edge Al Inference, Event-
Driven Architecture
Technology Used:
Python, FastAPI, YOLO26 (Ultralytics), Redis
(Pub/Sub & Streams), PostgreSQL, OpenCV,
FFmpeg, ByteTrack, SharedMemory,
WebSockets, Docker
Supervisor Name:
Ms. Amna lrum
Group Members:
Siddique Ahmad Ryan {i22-0781)
Muhammad Zubair Adnan (i22-0789)
Abdullah Saleem (i22 - 0882)
FAST NUCES ISLAMABAD CAMPUS

Underground Beyond
Underground Beyond is a story-driven street racing game set in a sprawling, neon-soaked city,
combining deep car customization, intense rival races, and adaptive polices chases with a high-
energy soundtrack and striking visuals. Every race, chase, and conversation is designed to keep
you immersed - Whether you're turning your car, outsmarting the law, or exploring the streets
for your next big challenge.
Key Features:
• Full vehicle customization, both for performance and visuals
• Responsive arcade-like driving physics for a balanced mix of realism and fun
• Dynamic police pursuits with adaptive tactics and roadblocks
• Unpredictable rival Al that uses smart strategies and gadgets
• Varied race types - City sprints, open-road runs, destruction events, drag and drift events, and more
• High-speed thrill factor with a strong sense of motion and acceleration
• lmmersive soundtrack blending underground beats, rock, and radio chatter
• Modern visuals with detailed lighting, weather effects, and cityscapes
• Original storyline inspired by classic street racing games
• Adaptive Character dialogue based on player's region and language setting
Utilizes Custom Technologies from
• Godot 3D Jolt Physics
• Blender 3D Modeling
• Pytorch Adaptive Al for Driver
and Police
• FL Studio custom sound effects
and music
• Custom World Building with
Blender and RoadRunner
Technology Used:
C++, Python, GDScript, Godot 3D with Jolt,
Blender 3D, Vulkan, Pytorch
Supervisor Name:
Mr. Shehreyar Rashid
Group Members:
lbtehaj Haider (22i-0767)
Ibrahim Awais (22i-0878)
Muhammad Taha (22i-0983)
FAST NUCES ISLAMABAD CAMPUS

VoxJobs
The Voice Job Assistant is an Al-powered platform designed for Pakistani job seekers and
administrators. It simplifies the job search process by integrating Artificial Intelligence, voice
interaction, and intelligent job matching into one accessible system, particularly supporting users
with limited digital literacy. There are two views of the system - User View and Adm in View. The
User View allows job seekers to search and filter jobs, receive intelligent recommendations,
generate personalized cover letters, and apply directly using natural language (English). Interaction
is supported through both text and voice using Speech-to-Text (STT) and Text-to-Speech (TTS). The
system employs semantic search and a Retrieval-Augmented Generation (RAG) pipeline to match
user queries with relevant jobs scraped from Pakistani job portals and allow to apply directly with
a single command.
The Admin View enables management of job scraping operations, updating job listings, and
monitoring overall system performance and data integrity. Features: Voice-driven and text-based
job search using NLP, real-time web scraping from Pakistani job portals, semantic job matching
using vector embeddings and RAG, direct job application with Al-powered cover letter generation.
Key Words: Artificial Intelligence (Al), Natural Language Processing (NLP), Retrieval-Augmented
Generation (RAG), Speech-to-Text (STT), Semantic Search.
Q
VOXJOBS
ARCHITECTURE
- -
- -
Technolo Used:
PostgreSQL, LangChain, React.js, Node.js,
- -- -:.9- - FastAPI, Selenium, Chroma, GitHub, Visual
TIMELINE
Studio Code
Su ervisor Name:
Dr. Mehreen Alam
Group Members:
Abdullah Aslam (i22 -0784)
m TEAM MEMBERS:
,0 0 AbdJI ah Aslam (22I-QT84)
n•dc-' Abdur Raheem Shaikh (i22 -0777)
,6.bdur Rahffrr Shai,(h (2:21--0777)
Afr ah Syed (22i• 1000)
m If 0 SUPERV§QR: Afrah Syed (i22 -1008)
tx,fVenreenAlan
FAST NUCES ISLAMABAD CAMPUS

Fasal Guard
FasalGuard is an Al-powered precision agriculture platform designed to assist farmers and
agricultural societies in making data-driven decisions for crop management. The system
integrates multiple agricultural data sources including climate data, soil health parameters, and
satellite imagery to monitor crop conditions, forecast yields, and detect environmental risks.
Through machine learning and deep learning models, the platform analyzes weather trends, soil
fertility, and vegetation patterns to generate predictive insights and recommendations.
The application provides an intuitive web dashboard where farmers can monitor crop health,
view yield forecasts, and receive alerts regarding potential risks such as drought, nutrient
deficiency, or extreme weather conditions. The system also supports alerts to ensure that
farmers receive timely notifications and take necessary action on time. By transforming
fragmented agricultural data into actionable intelligence, Fasal Guard helps farmers improve
productivity, optimize resource usage, and make proactive farming decisions.
Features include:
• Crop yield forecasting using climate and historical production data.
• Soil health analysis with fertilizer and irrigation recommendations.
• Satellite-based crop stress detection and visualization through heatmaps.
• Weather forecasting and climate risk prediction.
• Real-time alerts and notifications.
• Interactive dashboard for monitoring crop health and agricultural insights.
--
-,5 ~...,.~. -
-
-.:
~....,_.. .
.uf-••-
.. ...,_,..._..,.... ___ .._....,..d.....,..,_,,._..,
towM•~bm111S1WIU•&!IIM.-ltoftl!l9,.
M0ffll'4TTON
• Lad: of lnt41:9'•ut-d ~'1o.lll,ur• dHl•lon-a,pp(>ft •:Yft~
• fMfflJno, CMClllOM ate ortan rHClJYoe W\StNCI Of d~df1'11itn. Technology Used:
• ~,, ln>rou(gn o t. - op los.;s.u ca. ..... by'
2) Soll "uttlent d<etlc:lendff Python, React, Node, MongoDB,
3) Clt,,._w v.l'W:1'ilky
GitHub, Express
Supervisor:
Dr. Labiba Fahad
---
__ Group Members:
eIJ ~ ~
i-rll--i --------
Daniyal Khawar (22i-1066)
--,.. -
----
Muhammad lqrash Qureshi (22i-1174)
Hammad Shabbir (22i-1140)
FAST NUCES ISLAMABAD CAMPUS

Nutrilens
Nutrilens is an Al-powered mobile application designed for users to quickly understand the
nutritional quality and ingredient safety of packaged foods. There are two perspectives in this
system - the User View and the Backend/ML Service layer - the former is for everyday users who
scan product labels using their phone camera to receive automatic extraction of nutrition facts, a
personalized NutriScore (based on EU NutriScore and user health profile), ingredient safety
analysis (halal/ha ram, doubtful ingredients), and allergen warnings based on their saved
preferences. If the user feels that the analysis is inaccurate or incomplete, they can rescan, adjust
their health profile (e.g., HbAlc, allergens), and immediately see the updated risk-adjusted score
and ingredient assessment. The latter is the backend and ML service layer, which handles OCR via
Azure Computer Vision, NLP-based ingredient extraction with Azure Text Analytics and custom
parsing, ML-based hypertension/diabetes risk prediction and the risk-weighted NutriScore
calculation that combines nutrition content with the user's health profile.
Features include:
Scanning of nutrition labels and ingredient lists using mobile camera with OCR and spatial text
extraction.
Automatic parsing of calories, macronutrients, and per-l00g normalization, followed by EU
NutriScore calculation and grading (A-E).
Personalized risk-adjusted scoring that combines EU NutriScore with ML-predicted hypertension
and diabetes risks.
Ingredient analysis for halal/haram and doubtful items, including E-number interpretation, with
user-specific allergen detection and warnings.
Daily nutrition tracking dashboard that aggregates consumed items, persists data across sessions,
and shows macronutrient percentage breakdowns against recommended limits.
Key Words: Al, OCR & N LP, Machine Learning, React Native & Node.js
~C..A.N-
-Y-Ft...A.CK:.
IIIVIFl'FltC>"E-
•ln•••n~ nut:rldan •n•lv•I• llfaat-vl• di••••••
I• - • C o P r r .- • ,- . d . o - l .p ~ o 1 - u 1 1 ~ r . . o , . h . a d • o 1 • • l h ·1 • :; o h ,o. -l . -t - .: l ~h • 1 k y. • - h. go-.bit:• I• - - ~ R R u o • p d l p • g u • , o .. n - o 1 u , 0 t a : 0 r . 1 - l i 0 n • • l . - o . 1 - n 1 0 :e• • O .. . - . O . • ., M . • . f . 1 . u 1;f . O o . I . s O . . r . \
SVSTEIVI VVC>RKFLC>VV
•.CAN ..•.~ .OICT10N •C>KTHC"T"IC>N •T'IfNtA"OTKA.K..•.. 0 Technology Used:
React Native (Expo}, Node.js, Express.js,
Python (Flask), MongoDB Atlas
Supervisor Name:
Ms. Ra bail Zahid
'"'"'''=-··"" ..
,.,._..,.,.,..c..,.o......... ,,.-•
Group Members:
____
Muhammad Asjad (i22 - 1227)
, . -.--
"'-.:;~•·= ·;. ... \NV . , . ) . C . ,..__ ... _ .... " . t. Hassaan Afzal (i22 -0918)
•
Hamid Ali (i22 -1047)
FAST NUCES ISLAMABAD CAMPUS

ENGAGE OPTI
Engage Opti is an end-to-end automation platform designed to scale small-to-medium e-commerce
businesses. It bridges the gap between digital marketing and operational fulfillment by utilizing
Agentic Al to manage everything from initial Meta Ad lead generation to final mile delivery.
Features include:
Meta Ads & Marketing Automation: Manage Meta ad campaigns, automate lead conversion into
WhatsApp conversations, and track real-time marketing performance from a single dashboard.
Al-Powered Customer Interaction: Deliver multilingual 24/7 Al support with voice-to-text
processing and seamless chat-based product ordering through WhatsApp.
Intelligent Logistics & Delivery: Optimize delivery routes, automatically assign riders based on
location, and support drivers with a mobile toolkit for navigation and COD reporting.
Operational & Human Oversight: Ensure smooth operations with human-assisted Al support,
automated inventory updates, financial reporting, and a centralized admin control panel.
Key Words: Agentic Al, WhatsApp Automation, Route Optimization, MLOps, E-commerce
Logistics.
Technology Used:
Next.js, FastAPI, La ngGraph, Kot Ii n, FireBase,
Docker
Supervisor Name:
Mr.Owais ldrees
Group Members:
Aniq Noor (i22 - 0987)
Haziq Naeem (i22 - 1214)
Ali Hassa n(i22 - 2689)
FAST NUCES ISLAMABAD CAMPUS

Student Engagement Analysis using Computer Vision
(Engage-AI)
Engage-Al is a multimodal Al system designed to objectively measure and analyze student
engagement in classroom environments using computer vision. The system integrates emotion
recognition with behavioral action detection to deliver comprehensive, per-student and class-wide
engagement analytics across successive lectures.
The system processes classroom video footage through a sequential pipeline: video input is pre-
processed and fed into a YOLO-based student detection module. Each detected student is then
analyzed through two parallel streams - an emotion recognition model and an action detection
model. The outputs of both streams are fused together through a weighted multimodal fusion
engine to compute meaningful engagement scores. Results are visualized as engagement graphs
and displayed on role-based dashboards for both Teachers and Heads of Department {HOD), with
automated report generation.
Features include:
- Per-Student Engagement Analysis - tracks each student's emotional and behavioral
engagement individually across every lecture
- Overall Classroom Analytics - provides a class-wide engagement overview, helping educators
identify collective attention trends
- Multimodal Analysis - fuses both emotion recognition and behavioral action detection for
comprehensive, layered engagement insights
- Multi-Class Engagement States - detects approx. 9 distinct states including confusion,
yawning, hand-raising, and more, going beyond binary classification
- Teacher & HOD Dashboard - role-based dashboards; teachers view per-student and class-
wide insights while HOD accesses overall institutional engagement trends
- Actionable Educator Reports - auto-generated visual engagement reports per lecture
empowering data-driven teaching decisions
Key Words: Computer Vision, Student Engagement, Emotion Recognition, Action Detection,
Multimodal Al
5:.1":.'~.""
MK<.al ,_. ... :n,.4\TM.11
S..,tu,l>Sa·u, :r.t41i.-..:.1
Student Ena.•11ement Anabsis ...sin1: Com1>\fterVlslo1t
Engage-Al
n. .... .,..,.-•.. . .~.,.••<"~n• If f..,l<_K,-.a.•,o_, .,._ w~,n, w • u..,. . . , . . .. , , - 1 . > ,. 1 . . , , , . . • ,,. - ,,. . • ,, • . . , n,,,.n.,".,'., •m·•,•n·&,.rn.ur, l ,h.>,.._....,.n,..,.,.n.u, ,
, ,.,,u,......,4, ... ,,,....,w, "'"'"'" .,. ..1 yu. ..
Workflow Technology Used:
Python, OpenCV
Fast API, React.js MySQL, MongoDB, Docker,
visua I studio code
Supervisor Name:
Dr. Qaisar Shafi
Group Members:
• ~•.lt.lAi.SIOO-.An.llyti(:~
• • M ·· u • ll • " I - t o - n • cA:,n,.•..l.p,...•.. ,.... .u>ofy,..~ M Abdurrahman l<han (i22 - 1148)
Timeline
-•CC'..c_,,..
,_......u -..._., _ .,. #llpr-.lun
Sohaib Sattar (i22 -0962)
,.
Tools and Technologies
. n .u 0 M Bilal Javed (i22 -0788)
FAST NUCES ISLAMABAD CAMPUS

Kairo: Context-Aware Meeting Intelligence
Kairo is an Al-powered context-based meeting intelligence platform designed to enhance how professionals
capture, analyze, and extract value from virtual meetings. It provides real-time transcription, speaker
identification, Al-driven summarization, automated action item extraction, sentiment analysis, and
contextual knowledge management to improve productivity and collaboration. The system is built with a
React and Typescript frontend for user interaction, a Node.js and Express backend for meeting orchestration
and API services, and a Python-based Al layer that powers transcription, summarization, sentiment
detection, topic identification, and decision extraction.
Features include:
1. The automated meeting bot joins Google Meet and Zoom sessions and provides live transcription
with speaker identification and streaming updates.
2. The live Al insights dashboard displays real-time action items during meetings, tracks sentiment and
visualizes topics, and generates comprehensive post-meeting reports.
3. The advanced summarization system generates executive, detailed, and structured summaries,
4. The meeting management system stores searchable transcripts, audio recordings, and enables
contextual knowledge recall across sessions.
5. Intelligent knowledge graph connects insights, decisions, and action items across meeting history for
enhanced contextual recall.
Key Words: WhisperX Speaker Diarization, Puppeteering, WebSocket Real-Time Streaming, Multi-Agent Al
Architecture, Semantic Memory
+
K~IR0
A Context-Aware Meeting Assistant
Don't Just Record, Understand and Execute
Technology Used:
React, Node.js, PostgreSQL + Prisma, WhisperX,
Python, Puppeteer, Tailwind CSS, LangChain,
pgVector, Sentence Transformers, WebRTC,
TIMl!LINI!
ire base
Jan-Ma•
: •D ~ : .. ~ -f ~ -· ~ ed ~ re ~ +n ~ t- ~ rm ;c :r ; b ; t~:~itte-"· • • , A -. c rC h. T ,, > ,- lt c Kc ~ . < n . l 'k x ; l ; • d 1 : ; , ,r r , or::, !Je")trc~ er> Supervisor Name:
•'-'11t,t1,i;ll.~ory ro:iin,.f,(.,••&->ct.,dP.l'(;r,l
Dr. Ali Zeeshan ljaz
\,J ' ' ,, •~ _____
Gr_o__u_p,_ _M_ _em_ber_s:
Hafsa lmtiaz (i22-0959)
Apr•JuH
• • • e n r c c ,: : t > : - , le 1 :, p i o r : s e ,· e : , 1 d . t t , r - d d - A . , . e J · : l i ,r \ ; • s h ,< n -j: · h • o • lo \ l t 1 . W i-,. K r :;\o· • • • l C N r > t c c l< n g \ r. m , ro ,. U : : f c o p d .r ~ T ) o , K .. n r cm c h dr,-~, ,I ',(~(,' I - - - - - Aree - n Zai - nab (i - 22-11 - 15)
• f,rn za<h)ll'~....,t•d•"~.
TOOLS G-TlliCHNOLOQIES Are e ba Riaz (i22-1244)
m ... - Dr. Ali S Ze u c p s e h r a vi n s o lja r: z
()Prisma
ream Members:
" 0 ' t-afsa lrntio?z I i~2-0959
Arecba Riaz I i22-1244
dod<er A.rccn Zainab I i22-11~5
-
FAST NUCES ISLAMABAD CAMPUS

| Acadomi - |     | Al-Powered Interactive Learning Platform  |     |     |
| --------- | --- | ----------------------------------------- | --- | --- |
Acadomi  is  an  Al-powered  personalized  learning  platform  designed  to  enhance  student
engagement, focus, and knowledge retention in higher education. The system is developed by
keeping  the  perspective  of university  students  and  academic  learning  challenges  in  mind,
particularly  for theoretical  and  language-driven  subjects  such  as  Computer  Science  theory,
Business, Social Sciences, and Humanities.
The platform provides an interactive Al tutor that actively teaches students instead of relying on
passive content consumption. Students can upload learning materials such as handwritten notes,
PDFs,  or audio files,  from  which  the  system  extracts  key  concepts  using  Al-driven  content
processing. Based on this content, Acadomi delivers real-time, classroom-style teaching sessions,
where  the  Al  explains  concepts  step-by-step  (similar to  a teacher explaining  on  a  board),
immediately answers questions as they arise, adapts explanations to the learner's level, and
encourages active participation throughout the learning process.
Acadomi supports collaborative learning by enabling group study sessions where multiple students
can interact with the Al tutor simultaneously. To improve engagement and reduce distractions,
the system includes focus detection, which monitors learner attention (with consent) and prompts
the student when focus drops. Additionally, the platform provides revision and retention tools
such  as  concept  bookmarking,  Al-generated  recaps,  smart  cheat  sheets,  and  podcast-style
summaries to reinforce learning through active recall and spaced repetition.
The goal of Acadomi is to transform traditional online learning into an active, engaging, and
retention-focused experience, aligned with the principles of Education 4.0.
Keywords: Artificial Intelligence in Education, Interactive Learning, Personalized Tutoring, Focus
Detection, Knowledge Retention.
ACADOMI
,_i
An AJ-powered interactive learning platform to enhance higher education
engagement, focus, and retention. keeping in mind oolverSlty student challenges
..
ARCHITECTURE
Dtploymont
| Content Layor  | Al Processing Laye,  | Backtnd laytt  | Layer  |     |
| -------------- | -------------------- | -------------- | ------ | --- |
-
-
'f
| ~ 81  |     |     | Docur  |     |
| ----- | --- | --- | ------ | --- |
-
0
| -0- | h1  |     |          |     |
| --- | --- | --- | -------- | --- |
|     | I   |     | fastAPI  |     |
G<nfll
,.,...i
| Upload POF  |     |     | -   |     |
| ----------- | --- | --- | --- | --- |
or Images
|     | f!§.C.0...1.f.l'.1,    |     | Huac•  | Technology Used:  |
| --- | ---------------------- | --- | ------ | ----------------- |
React,Python, Node.js, Express OpenCV,
TIMELINE
MediaPipe,Mongodb SOL Server,google
__
cloudvision,AWS
|     |     |     | ...  | Supervisor Name:  |
| --- | --- | --- | ---- | ----------------- |
~,.,..-::::--
|                |                | Dec • Ftb        | March -April  | Ms. Rabail Zahid            |
| -------------- | -------------- | ---------------- | ------------- | --------------------------- |
| TOOLS          |                | TEAM MEMBERS     |               |                             |
|                | t              |                  |               | Group Members:              |
| ,-             | n•de           | PROJECT TEAM     |               |                             |
|                | ®  .......     | Abdullah Saghlr  | (i22· 1076l   |                             |
|                |                | MuneebAmir       | (i22·1188     | Abdullah Saghir(i22 -1076)  |
| React  Python  | Express  ·..;  | Salman Saleem    | Q22-0904)     |                             |
O
| -                  | a W S      | Supervised by:  |     | Muneeb Amir(i22 -1188)  |
| ------------------ | ---------- | --------------- | --- | ----------------------- |
| SQl.k .,_ ....., . | .._ _ ..,  |                 |     |                         |
FastAPI -00·  Ms. Rabail Zahid
(Fast Nuces] · Computer Science Department  Salman Saleem (i22 - 0904)

FAST NUCES ISLAMABAD CAMPUS

Academic Chatbot
Poke Vision is a lightweight driver-assistance system designed to deliver real-time road object
detections and lane tracking. Built to remain highly efficient for edge deployment on mobile and
resource-constrained devices, the project features a cross-platform mobile application that provides
real-time awareness by overlaying bounding boxes and lane lines directly on the driver's screen. The
system is divided into two main perspectives: the dashcam mode, which offers real-time guidance,
trip recording and alert generation, and the dashboard, which allows for offline backend analysis,
safety metrics, and driver's feedback.
Features include:
• Real-time road object detection that identities vehicles, generating accurate bounding boxes
and distance estimation for each entity.
• Lane marking detection via a segmentation-based network that translates road masks into
structured geometric polylines and gives off departure alerts
• Trip recording and cloud upload functionality, enabling offline batch analysis of the drive.
• Generation of trip analysis reports, safety indicators, and driver logs for Drivers to evaluate
and reflect on their driving safety.
Key Words: Advanced Driver-Assistance Systems (ADAS), Real-Time Object Detection, Lane
Segmentation, Edge Al Deployment, Driver Safety Analytics
Technology Used:
YOLO, Flutter, TensorRT, TFLite
FASTAPI, Docker,Docker Compose
Supervisor Name:
. Proximity Alerts
Dr. Mehreen Alam
-,:,. ..) ni,:. nucc,vo ~' .-.. dn '"~ f Y'--"--' ~....,t toe
- ( ... p tn Hp .,r Hl f,-.., lt
Group Members:
; : t Lane Alerts
',:j,:' \
f~,,,,1 T11, ,, l ", t,,.,,~~ •~' ,--.,1,,,t, 1< Daniyal Ahmed (i22 - 1032)
1 \ .,,. .--.,-, ---:> -x:>c t dr1"t111f';
Muhammad Ahmad (i22 - 1056)
Tools and Tech
/, ~~ CbJ A
Junaid Zeb (i22 - 8794)
FAST NUCES ISLAMABAD CAMPUS

Melody Mind
MelodyMind allows individuals to generate dynamic playlists using natural language prompts, image uploads, or
real-time mood descriptions. The system analyzes sentiment and context to recommend songs that align with
the user's emotional state. Users can also interact with the "Talk to Your DJ" feature to modify the playlist in real
time using voice input. Additionally, MelodyMind offers a stem separation feature that isolates vocals, drums,
bass, and instrumentals from songs for educational and remixing purposes. Users can also connect their Spotify
account to save generated playlists and play the songs through the app.
Features include:
•  Text-to-Playlist and lmage-to-Playlist generation using sentiment and context analysis.
•  Real-time mood switching through "Talk to Your DJ."
•  Deep learning-based stem separation for vocals, drums, bass, and instrumentals.
•  Playlist saving and integration with Spotify API.
Key Words:
Artificial Intelligence, Sentiment Analysis, Music Recommendation System, Stem Separation, Biometric Adaptive
Playback
|     |     |     | Technolo  | Used:  |
| --- | --- | --- | --------- | ------ |
PyTorch / TensorFlow
CLAP (Contrastive Language-Audio Pretraining
Model)
Supabase
React Native
| Rr in o   c:        | :: : o n 't e x ' t-o w o | re-e m ot-ion -O riv~n  |                    |           |
| ------------------- | ------------------------- | ----------------------- | ------------------ | --------- |
| p lo y li s         | ' t s   t o   li1 'e      |                         |                    | Python    |
| 1 ' A c :a k o      | t h o  r r' o c :o s s o  | f S lorn sopo..-e>tlo   |                    |           |
| 1.. .. .-i o re   ~ | c :c :: es . s rb •e -    |                         |                    | Fast API  |
|                     |                           |                         | Su  ervisor Name:  |           |
Ms. Marium Hida
Group Members:
Hassaan Anwar (i22 -0890)
| I<. E:          | F  E:.A..-r L.J ,R? E: E5  |                            | Saad Nadeem (i22 -1030)  |     |
| --------------- | -------------------------- | -------------------------- | ------------------------ | --- |
| (H\ffl Dolak• - |                            | i..f' •G·fJ•I  I l'laJJ11- |                          |     |
Mustafa Iqbal (i22 -1139)
| '  ,.  •111 PIIQIHI<  |                       | .           |     |     |
| --------------------- | --------------------- | ----------- | --- | --- |
| TUI le Pl&Ytsll       | 1....., II Plll)illl  |             |     |     |
| 11                    |                       | -... me II  |     |     |
I  cs, ..1 e Dllloreat
| I  I  I  --•-...   |     | dllMDRlltR1'MCI  |     |     |
| ------------------ | --- | ---------------- | --- | --- |
| SletJl sep..-aooa  |     | o 1·our DI       |     |     |
III
PROJECT DEVELOPMENT ROADMAP

FAST NUCES ISLAMABAD CAMPUS

Rocket Simulation
An advanced aerospace simulation platfo1m is being developed to bridge the gap between theoretical modeling and
practical experimentation, specifically tailored for high-fidelity research and defense training. There are two primmy
views of this system- the Simulation Core and the Remote GUI-the former is built in Unreal Engine to handle realistic
physics dynamics, including mass, thrust, drag, and atmospheric effects using an ISA-based model. The simulation
replicates complex flight profiles such as ve1tical launches, pitch-over maneuvers, and autonomous cruise phases using
a fourth-order Runge-Kutta integration scheme for numerical stability. The latter is a high-perfo1mance desktop
application for the operator, who monitors real-time telemetry-including altitude, velocity, and Mach number- and
issues commands such as ignition or stage separation. If the simulation requires offline operation, the system utilizes
locally cached ETOPO and GMTED2010 datasets to maintain topographic detail without internet access.
Features include:
• Aerodynamic Physics & Modeling: Real-time calculation of air density and drag force based on temperature,
humidity, and pressure data.
• Geospatial Terrain Integration: Global-scale 3D visualization using Cesium for Unreal with automated world
origin rebasing to prevent precision errors.
• Predictive Terrain FoUowing: An autopilot system using raycasting to maintain a constant altitude above
ground level (AGL) during low-altitude cruise.
• Secure Remote Operation: Low-latency command and telemetry streaming (<50 ms) over a ZeroT ier virtual
peer-to-peer network.
• Key Words: Unreal Engine, Cesium, Rocket Physics, Telemetry, Geospatial Simulation.
SUPERVISOR :
Dr. Lobibo Fohod
TEAM,
S11.o•cl ud Ihn Ahmad -221•0~8
loh~b Kh,,,n -22i-0946
brttheem Ft,,rrulc;h -2?1-1111
ROCKET
SIMULATION
MOTIVATION ,
:g
•B~~J~:-::.~~~i~=~\~:~li:~~io~i:-C,ca ~h:1
unprecedented aerospace fidelity,"
KEY• OB JECTIVES:
Technology Used:
I Prov.iC.;i tii~h-tidelity ph~sics with real-time remote interaction
• Stream globa terra n via Cesium ion integration
• Rea -time telemetry visualization via custom dashboard Unity, Unreal, Python, React, Electron, Cesium,
11#3=1 i-ii49t ZeroTier
Supervisor Name:
Dr. Labiba Fahad
Group Members:
Saeed ud Din Ahmed (i22 -0938)
RK 4 120 FPS 1:1 Zohaib Khan (i22 -0941)
• •> ' '
lbraheem Farrukh (i22 -1111)
FAST NUCES ISLAMABAD CAMPUS

HRFLUX
HRFlux is an intelligent HR automation system designed to bridge the gap between employees and
Human Resources departments.
There  are two views of this app: Employee View and Admin View. The  Employee View is for
employees to manage professional needs via natural language (English), including querying leave
balances, past leave history, and company policies. Using a LangGraph-based routing architecture
and RAG, the bot extracts answers from policy documents and can even draft documents like
salary certificates or NOCs. If an employee feels the answer is incorrect or the topic is sensitive,
they can escalate the query to the admin using the built-in feedback button. The latter is for the
admin, who will review escalated tickets (e.g., harassment reports or salary disputes}, manage
approvals, and update the organizational knowledge base to improve future bot responses.
Features include:
-Automated execution of HR workflows, including leave balance checks and time-off applications.
- Document-grounded Q&A using hybrid RAG for policy, schedule, and company guideline queries.
-On-the-fly generation of personalized HR documents like salary certificates and NOCs.
- Intelligent conversational routing with automated escalation for sensitive or unhand led queries.
-Admin portal for reviewing escalated tickets and updating datasets after manual intervention.
Key  Words:  Multi-Agent  Systems,  LangGraph,  Retrieval-Augmented Generation (RAG), Automated  HR
Workflows, Natural Language Processing (NLP)
•
HRFLUX
HR FLUX
A MULTI-AG-E-N-T HR ASSISTANT
,,-
Group Members:
| An Al-based HR automation      |     |     | Fatima Obaid    | ??1-0475  |     |     |
| ------------------------------ | --- | --- | --------------- | --------- | --- | --- |
| system designed to cut down    |     |     | Hadla Mazhar    | 221-0487  |     |     |
| on repetitive manual work and  |     |     | Shayane zalnab  | 221-1049  |     |     |
make the overall employee
| experience smoother.  |     |     | Supervisor:  |     |     |     |
| --------------------- | --- | --- | ------------ | --- | --- | --- |
Dt. Adil Majeed
ARCHITECTURE
| ,......,....,,.,. 11:t  |     | .c!!.l leiirJ  |     | "·-·--·- | ~ I  |     |
| ----------------------- | --- | -------------- | --- | -------- | ---- | --- |
~--,--
~~..._... .,.f ,f_. ._.._
| -    |     |                        |           |           | -   |                   |
| ---- | --- | ---------------------- | --------- | --------- | --- | ----------------- |
|      |     | . AIAg.mOn:"-1,r..,..  |           |           |     | Technology Used:  |
|      | I   |                        |           | ::=--i    |     |                   |
| 1,:  |     |                        | l 1a --~  | I fl. ..  |     |                   |
Alt~= ~~r  lu,etot  11e ... :,. ..  Python, Git, MySQL, Chroma, React, LangChain,
|     |     | u--•~  |     |     | I   |     |
| --- | --- | ------ | --- | --- | --- | --- |
I
FastAPI, Postman, Visual Studio
......~..& ,flM.al..llrlol~iflN . ... .....-e.:r
r;::. .. ,..
|          |               | 11, | .-~.=. . ""11•  | ---?]  |     | Supervisor Name:  |
| -------- | ------------- | --- | --------------- | ------ | --- | ----------------- |
| ~ ·~-•)  | ........O Ii  |     |                 |        |     |                   |
Dr. Adil Majeed
| (a EJremalH11$/P.1y,olN>II  | (   | On1~~  | I   |     |     |                 |
| --------------------------- | --- | ------ | --- | --- | --- | --------------- |
| -                           | -   |        | -   | -   |     |                 |
| TIMELINf                    |     |        |     |     |     | Group Members:  |
| .. .                        |     |        |     |     |     |                 |
Fatima Oba id (i22 -0475)
|     | i   |     | y   | i   |     |     |
| --- | --- | --- | --- | --- | --- | --- |
•  ~':'~ ~ n•
| • •    C U o u t l O U U C C O s ll u t   cnOl'I  | • ~ | m .. . - , l  |     | •  U l k ll u y 'UUOlr  |     |     |
| ------------------------------------------------- | --- | ------------- | --- | ----------------------- | --- | --- |
UW M o! ;' '  · =, .-.,x~c ~Qn •I  r o g   - ~ i flQ  • lo n l .1 "1 :i,  Hadia Mazhar (i22 -0487)
|     |     |     | cm,a.e | o   |     |     |
| --- | --- | --- | ------ | --- | --- | --- |
Shayane Zainab (i22 -1049)
MusaC:

FAST NUCES ISLAMABAD CAMPUS

Pheno Forensic
Pheno Forensic is an end-to-end genomic visualization system that predicts visible human physical
traits from DNA data and renders them as 3D facial avatars. The system takes Single Nucleotide
Polymorphism (SNP) data in standard genomic formats (VCF, BED/BIM/FAM) as input and
processes it through a machine learning pipeline to predict traits including eye colour, hair colour,
skin tone, and basic nasal morphology. Prediction models - Logistic Regression for categorical
traits and XGBoost for ensemble results - are trained using reference panels such as HlrisPlex-S
and GWAS datasets. The predicted traits, along with confidence scores, are then mapped onto a
parametric 3D face model built in Blender/MakeHuman, where textures, skin shaders, iris colours,
and mesh parameters are adjusted accordingly. The final avatar is rendered from multiple angles
and exported in standard formats (OBJ, GLB, PNG). The system is structured as a two-module
pipeline: Module 1 handles SNP preprocessing, trait prediction, and confidence scoring; Module 2
handles trait-to-avatar mapping, 3D rendering, and result export. Pheno Forensic targets forensic
investigators, genetic researchers, and educational users, offering an intuitive visual alternative to
text-based genetic predictions. It emphasizes ethical design through session-based data deletion,
AES-256 encryption, anonymization, and bias auditing.
Key Words: DNA Phenotyping, SNP Analysis, Machine Learning, 3D Avatar Generation, Forensic
Bioinformatics
Saad IILLkhor 221.J.880
~- "-··' ) PHENOFORENSIC W
At
O
..
h
,~
C
b
IG
1
d
,- h
G
e,
u
:,i
l z
2
a
2
f'
1
"
0
2
8
2
A
1
A
25 26
Supe-rvlsor1
Dr. Muho"""'°U 1,..11t.h;111,;1
MOTIVATION
ONA contains the blueprint for
our appearance. yet It remains
largely unread in treditionel
analysis. This project utilizes
advanced phenotyping to
translate genetic n,orkers
into visual representations,
unlocking new possibilities for
biological identity.
Technology Used:
DESIGN
Python, XGBoost, Logistic Regression, Blender,
MakeHuman, NumPy, Pandas, HlrisPlex-S,
GWAS, VCF/PLINK
Supervisor Name:
Dr. Muhammad lshtiaq
1. Rew Genomtc 2. Predlct:ed 3. Pheno1ypfc
Code 30 M ••.h Synlhoafs
M d e a p ta p l s n y g n t c h o e m si p s f o e > n c d S N la P y a e r t e o d 3 m 0 o fa s c h la re l n co d o e r r d in i g n a t.o te c • r u e s a i t n e g Group Members:
a clear lnte,-pret1ve bridge.
Muhammad Ateeb (i22 -0888}
Waheed Guizar (i22 -2526)
0
V$ Cod• Ghhub 1-yl:v,rch Saad lftikhar (i22 - 1880}
FAST NUCES ISLAMABAD CAMPUS

SpineScan - Automated Lumbar Spine Degeneration Classification
SpineScan is a deep learning-based system designed to automatically classify lumbar spine
degenerative conditions from MRI scans. The system analyzes both sagittal and axial MRI views to
detect degenerative patterns across five lumbar disc levels. It performs intelligent slice localization
and applies deep learning models to identify multiple spine conditions with improved consistency
and reduced reliance on manual interpretation.
The system also integrates Grad-CAM-based explainable Al to visually highlight important regions
in MRI images that influence the model's predictions. A user-friendly web interface allows users to
upload MRI scans, view predictions, and interpret model-generated heatmaps, making the system
useful for research and clinical support.
Features:
-Automated detection and classification of lumbar spine degenerative conditions from MRI scans
- Multi-view analysis using both sagittal and axial MRI sequences
- Grad-CAM-based explainable Al to highlight important regions influencing predictions
- Classification across five lumbar disc levels covering multiple degenerative conditions
- Visual interpretation support to improve transparency and trust in Al predictions
Key Words: Computer Vision, MRI Analysis, Lumbar Spine Degeneration, Medical Image Classification,
Explainable Al
Technology Used:
Python, Colab, OpenCV, React.js, Ultralytics
Supervisor Name:
Dr. Labiba Fahad
Group Members:
Shayaan Khalid (i22 - 0863)
Hammad Amer (i22 - 0877)
Aazib Abdullah (i22 -1031)
FAST NUCES ISLAMABAD CAMPUS

Deploymint
DeployMint is a cloud deployment automation application designed for developers and DevOps
engineers, which automatically generates and applies deployment artifacts for cloud server
deployment. The users provide a repository link, and the application generates different artifacts
by analyzing the codebase. The application then applies the files by executing the required
commands in a transparent terminal environment. An integrated Al assistant assists users during
the process, stores chat history for contextual support, and helps resolve issues. After the
application of files, if the user faces any issues with the deployed codebase, the application logs
errors, if any, and suggests fixes with user consent. A research-based module for detecting and
fixing Ansible code smells using PDG analysis adds a novel contribution to the project. In this
manner, the application eliminates the complexity of manual cloud configuration.
Features include:
- Automated Generation of Deployment Artifacts (Dockerfile, Kubernetes manifests, Ansible and
Terraform Configuration files)
- Automated Application of Generated Deployment Artifacts
- Ansible Code Quality Assurance using Program Dependence Graph Based Analysis
- Al Assistant for Guiding User in Setting Up DevOps and Error Fix
Key Words: Cloud Deployment Automation, DevOps, Program Dependence Graph, Ansible
A DevOpa Automation Tool With Anaible Code Quality
Assurance
ARCHITECTURE
Aa ~ lr:11
..-~1\rirof
rllPOt,it.ar)I
-_-...-,
Technology Used:
t ....l rdilol(¥1d
MERN, Python, Postgres, Visual Studio code
IIMELINE
Supervisor Name:
Dr. Muhammad Arshad Islam
Group Members:
Afsah Areeb (i22 - 1046)
·~·d?··
Anoosha Ali (i22 - 1242)
TEAM MEMBERS
••-
k2243&e Saleh• In.a,, Saleha I rum (k22 - 4360)
i21MIM2 Anooaha Ali
122"1e4D AfNh Anteb
..
~ iaor:
Dr,~ Arahad Ialam
FAST NUCES ISLAMABAD CAMPUS

AIVA: Al-Powered Assistant for Live Commerce Engagement
AIVA is an Al-powered assistant designed to enhance engagement and operational efficiency
during live selling sessions. It supports sellers, particularly small and medium-sized businesses, by
automating real-time customer interactions, accurately detecting buyer intent, managing orders,
and minimizing manual workload during livestreams. By providing instant responses in both
Roman Urdu and English, AIVA ensures timely communication with customers, improves
satisfaction, and allows sellers to concentrate on product presentation while the system
seamlessly handles engagement and sales operations.
Features include:
• Real-time comment monitoring and instant responses
• Buyer intent detection and order-taking chatbot
• Seller dashboard for inventory and order management
• Voice note processing and OCR-based payment verification
• Visual product search and personalized recommendations
Key words: Live Commerce, Al, NLP, Automation. Recommendation Systems
e
AVA
Al VIRTUAL ASSISTA l\T
Transforming Real-Time Engagement into seamless commerce
ARCHITECTURE
Technology Used:
Python, NLP, CV, STT, REST APls, WordPress,
Hugging Face, Ollama, PyTorch, MongoDB
TIMELINE Su ervisor Name:
...
NlP and Conver·w,tk11w.l UI S E y1 n l h • l n n 1 c l 1 e :m ,tl ~ n n a t I Ms. Nigar Azhar Butt
i:tffl~ t:'le UI and stal:lillts
Ad:tslnttUJltnta11tonaUO'l thl&<(Slam.
~:~n.;..:..:..:...:..:. £'•,,IO,:Ul7lderJ:Uf~ld ~n:d ,lf:l•:n:.-. ,e. . -••··-•·i~:::.':~~-------/~:~-- Group Members:
8ultl1 lil'IICOA lfSl«n fn."Ull"l(M ,._. i'll,.,.-,:t,r.,n tN'o:utt, Sara Akbar (i22 -0846)
by lnto,p,"I ll'OICe nput encl ~ ,e(I
A.Pie., a b.,s.ot iollo, I.I, and rea,nme,a,11orl5
diluplpatnn
5-0ot
Noor Fatima (i22 - 1036)
JPNl1PIIIM
i:220846 Sora Akbar Abdul Munim Baig (i22 -1080)
i221036 'loor Fatima
12"J"OAO Ahd JI Munlm Roig
IUl'illVIIOII
Ml!io Hi,-,ur l.d HJf Bull
FAST NUCES ISLAMABAD CAMPUS

CORAL - Consensus-based Refinement And Learning for Urdu ASR
CORAL is a novel Al architecture designed to overcome the performance ceiling of low-resource Urdu
Automatic Speech  Recognition (ASR). Since traditional models struggle with domain brittleness and
error propagation, CORAL solves this via a two-stage machine learning pipeline. First, an ensemble of
acoustic models (Whisper, Wav2Vec2) generates multiple transcript hypotheses alongside word-level
confidence scores. Second, an instruction-tuned Large Language Model (LLM) intelligently synthesizes
these confidence-annotated hypotheses to produce a highly accurate, error-corrected final transcript
without requiring expensive acoustic fine-tuning.
Features include:
1)  Multi-model hypothesis generation utilizing diverse ASR architectures.
2)  Few-shot  (In-Context  Learning)  LLM-guided  post-processing  for  complex  phonetic  and
grammatical error correction.
3)  Word-level confidence extraction to precisely guide the LLM's consensus reasoning.
4)  Interactive web interface for real-time audio processing and model output comparison.
Key  Words:  Urdu  ASR,  Large  Language  Models,  Ensemble  Learning,  Confidence  Estimation,
Speech-to-Text
Technology Used:
CORAL
Al & LLMs:
CONSENSUS-BASED REFINEMENT ANO LEARNING
Novel Al architecture combining multi•model ASR ensembles, confidence scoring, &  Alif-1.0-8B, Qalb-8B, HuggingFace Transformers,
instrudion•tuned LLMs transforming Urdu speech recognition.
BitsAndBytes (4-bit Quantization)
Acoustic ASR Models:
Whisper v3 (OpenAI), Wav2Vec2-XLSR
Backend & Processing:
Python, PyTorch, Flask REST API, Librosa
Web (Frontend):
Next.js, React, Tailwind CSS
Infrastructure:
Google Colab (GPU Inference), Ngrok
IHIHIIE
Supervisors Name:
| (Sep -Oct 2025)        | (Nov Dee 2025)       | (Feb • Mor 2026)  | (Apr Moy 2026)  |     |
| ---------------------- | -------------------- | ----------------- | --------------- | --- |
| Foundation &           | Instruction Pt"ompt  | End-to-End        | Optimization &  |     |
| Confidence Extraction  | Oeve~prrwtnt         | Integration       | Evaluation      |     |
Supervisor: Ms. Kainat Iqbal
| • Integrate ASR models  | • Design prompts      | , lntcgrotc pipeline  | • Cotibrate               |                                 |
| ----------------------- | --------------------- | --------------------- | ------------------------- | ------------------------------- |
| • E:o:troct word•ltwel  | • Test LLM behov1or   | • Rvn  preliminary    | • i;lroflle lotenc)' and  |                                 |
|                         |                       | evolvotions           | optimizo                  | Co-Supervisor: Ms. Saira Qamar  |
| conftdences             | , St,vctvred          |                       |                           |                                 |
| • Establish baselines   | input/output parsing  |                       | • Prepare final repOf't   |                                 |
Group Members:
TOOLS
TEAM MEMBERS
| ,,  0  | 00  |     |     |     |
| ------ | --- | --- | --- | --- |
Rafay Khattak (i21-0423)
|     | Meta  | SupeMsor: Ms. Kainat Iqbal  |     |     |
| --- | ----- | --------------------------- | --- | --- |
Co-Supervisor: Ms. Saira Qamar
co @  . kaxrt  Aafay Khattak (121-0423}  Nauman Hafeez (i21-0416)
| \_ngrok  |     | Houman Hafeez (i21-0416)  |     |     |
| -------- | --- | ------------------------- | --- | --- |
Ali lrfan (i21-2572)
Ali lrfan (i21-2572)

FAST NUCES ISLAMABAD CAMPUS

|     | lnterroSense - |     |     | Al-Assisted Interrogation Support System  |     |     |     |     |     |
| --- | -------------- | --- | --- | ----------------------------------------- | --- | --- | --- | --- | --- |
lnterroSense is an Al-powered interrogation support  platform that assists law enforcement and
investigators during high-stakes interrogation processes. It integrates multimodal Al combining
computer vision,  speech  processing, and  natural  language  understanding to deliver real-time
behavioral insights and generate psychologically-informed interrogation questions tailored to each
case. The  system  analyzes  suspects' facial  micro-expressions,  gaze  patterns, and vocal  stress
indicators that are often too subtle for humans to consistently detect. lnterroSense is designed to
enhance human judgment rather than replace it, ensuring ethical oversight remains central to the
process.
Features include:
•  Real-time facial emotion and micro-expression recognition
•  Gaze tracking to monitor eye contact and aversion patterns
•  Voice sentiment and stress analysis using Wav2Vec2 and Whisper
•  Adaptive question generation using fine-tuned LLMs with difficulty progression
•  Real-time behavioral dashboard and post-session report generation
Key Words: Multimodal Al, Behavioral Analysis, Micro-Expression Recognition, Adaptive Question
Generation, Interrogation Support
:Supervisor
Mr. Sud Salman
;:;;;;--
il'eam Members
| F25-191-D-lnterroSense  |     | • Rehan  |     | 221-o965  |     |     |     |     |     |
| ----------------------- | --- | -------- | --- | --------- | --- | --- | --- | --- | --- |
, Sud Murulffn 22!-0835
Al-Assisted Interrogation
|     |     | ,   |     | 221-2427  |     |     |     |     |     |
| --- | --- | --- | --- | --------- | --- | --- | --- | --- | --- |
Support System
Overview
lnterroSense Is an Al·based Interrogation support system that enhances
Investigations through real-time facial, vocal, and conversational analysis. It
assists investigators by generating adaptive questions and producing
structured analytical reports to support objective decision-making.
| Workflow  |       |     |                     |     |     |     |     | Technology Used:  |      |
| --------- | ----- | --- | ------------------- | --- | --- | --- | --- | ----------------- | ---- |
|           | l=.J  |     | Facial, Voul&Te~j   |     |     |     |     |                   | css  |
Reactjs, Nodejs, MongoDB, HTML,
| n/   | r-::sslonSetup/     | m   |     | --~·••y•»  |     |           |                                   |                                        | I   |
| ---- | ------------------- | --- | --- | ---------- | --- | --------- | --------------------------------- | -------------------------------------- | --- |
|      | c. .c oetallUpload  |     |     |            | 7   |           | PyTorch, TensorFlow, HuggingFace  |                                        |     |
| 6    |                     |     |     |            |     | 1------I_ |   _                               | Q . ;. ... __ ~y  -, ~o-c- ke-r,- ~~~  |     |
MultlUodalOata Capture  Sehavloral51gnal Fusion  r an s f_ a  r_me_rs_,  p e n   ,
++
lnveselgator
Supervisor Name:
|               | Report Generation  |      | Adaptive Question Generation  |     |         |     |     |                  |     |
| ------------- | ------------------ | ---- | ----------------------------- | --- | ------- | --- | --- | ---------------- | --- |
| Timeline      |                    |      |                               |     |         |     |     | Mr. Saad Salman  |     |
| •             | •                  |      |                               |     | •       |     |     |                  |     |
| Phase l       | Phil.Se Z          |      | Phase3                        |     | Phase4  |     |     | Group Members:   |     |
| SRS, loC~cup  | 8eUViofai          | ...  | Lu.I Que-stlon Gef'I,         |     | Final   |     |     |                  |     |
OOC:urit«'lt UPioad,  DUhboaJd,AI  sewon &.O.f\llemfflt,  lnterara.uon Md  Rehan Tariq (22i-0965)
| Sutlon                 | lnt.c,Mlon4. lettlnJ  |     | Report  | & Testlri&  | D~loytftetlt  |     |                            |     |     |
| ---------------------- | --------------------- | --- | ------- | ----------- | ------------- | --- | -------------------------- | --- | --- |
| Tools & Tmechnmology   |                       |     |         |             |               |     | Saad Mursaleen (22i-0835)  |     |     |
<&3>@
,m
JS
Arshman Khawar (22i-2427)

FAST NUCES ISLAMABAD CAMPUS

|     | Resembl - | Research Paper Recommendation System  |     |     |     |
| --- | --------- | ------------------------------------- | --- | --- | --- |
Resembl  is  a  research  paper similarity and analysis system  designed to help researchers and
students  efficiently explore and  understand academic literature. The platform allows users to
explore  relevant  research  papers and  identify related  work based  on contextual similarity. It
highlights essential  ideas through section-wise  summaries,  making it easier to grasp the key
contributions of each paper. Users can also discover topics within a research corpus and analyze
trends across different areas of study. In addition, Resembl provides a Q&A interface that enables
users  to understand and compare papers by asking questions about their content, creating a
structured and interactive way to navigate large collections of research papers.
Features include:
1. Search and retrieve papers using keywords, paper IDs, or uploads.
2. Discover related papers through similarity-based recommendations.
3. Generate section-wise summaries of a paper.
4. Explore papers through an interactive Q&A feature.
5. Explore research trends across topics and venues.
Key Words: Semantic Similarity, Research Paper Recommendation, Clustering, RAG, Trend Analysis
resembl
Research Paper Recommendanon System
| ---- | PROJECT FLOW ---- |     |     |     |     |
| ---- | ----------------- | --- | --- | --- | --- |
NLP & ML Processing
|     | :•,i::::;~,:  ••   | ~.,;.9  |     |     |     |
| --- | ------------------ | ------- | --- | --- | --- |
: l" 'I.
|     | •WI._  | ,y   'rl"::l'ff,J'--rfr•••: .  |     |     |     |
| --- | ------ | ------------------------------ | --- | --- | --- |
orX1v po~ PDF uplood
RecommefldotlOl'\1  O&A
| ------ |     | TIMELINE ----- |     |     |     |
| ------ | --- | -------------- | --- | --- | --- |
sEP-ocT
1  •
0 •Co llect and preproceu papers
|                                     |          | •  S e ,  u | p  b o d : a rl d  a n d  1 n ~ t 1 on    |     |     |
| ----------------------------------- | -------- | ----------- | ----------------------------------------- | --- | --- |
|                                     | NOV DEC  | I  l m p !  | e m er it  s i m i la ri ty  s e a r c h  |     |     |
| • Topic clustor1n9 wnh word clouds  |          | 0           |                                           |     |     |
• Tott1porol ,l'(ll'ld ono\y$1$
• S.Ction.-w1w 5Ufflmor12ot10n
JAN-APR
0  • Poper-level O&A
• Multi popor compor1son
MAY-JUN
|     |     | • Network 9roph visualization  |     |     | Technology Used:  |
| --- | --- | ------------------------------ | --- | --- | ----------------- |
• Improve UI/UX
| • Fu'I 1nltt9rahon and hHling  |     | 0   |     |                                             |     |
| ------------------------------ | --- | --- | --- | ------------------------------------------- | --- |
| • Oeploymont                   |     | I   |     | Next, React, PostgreSQL, Pgvector, Python,  |     |
FastAPI
Q
SUPERVISOR
| ---- | TOOLS - | --- | Ot. Al, Zea1hon IJDZ  |     | Su  ervisor Name:  |
| ---- | ------- | --- | --------------------- | --- | ------------------ |
TEAM MIMlf:11:S
Hon o Fonoi 22l-6~41
|     |     |     | Fclu"IO Homud 221:-4656    |     | Dr. Ali Zeeshan ljaz  |
| --- | --- | --- | -------------------------- | --- | --------------------- |
|     | 0   |     | Zl)Od B n H,thom 22L-6855  |     |                       |
Group Members:
Hania Fayyaz (L22-6941)
Ziyad Bin Hisham (L22 - 6855)
Fatima Hameed(K22-4656)

FAST NUCES ISLAMABAD CAMPUS

Mashwara-e-Taleem
Mashwara-e-Taleem is an Al-powered consultation platform designed to assist students who want
to pursue higher education abroad. The system provides guidance regarding universities,
scholarships and admission related information in natural language. Students can enter their
academic profile to receive university recommendations based on their background and eligibility.
The platform also provides scholarship suggestions based on student preferences such as country,
budget and study interests. The system also includes an intelligent chatbot that answers queries
related to universities, admission requirements and study abroad guidance. Students can also
upload their SOP or Resume to receive feedback and suggestions. If the chatbot fails to provide a
correct answer, the query can be forwarded to the ad min panel where the ad min can update the
knowledge base to improve future responses.
Key Features:
•  University recommendations based on student academic profile
•  Scholarship recommendations based on student preferences
•  Al chatbot for study abroad related queries
•  SOP and Resume document analysis
•  Personalized guidance for students
•  Admin panel for updating knowledge base
Mashwara-e-Taleem
| •                 | •          | •               | •                 |     |                   |
| ----------------- | ---------- | --------------- | ----------------- | --- | ----------------- |
| l t1in·nit,t wnJ  | Uia1bo1    | SOP anJ         | l't:NOna i· 1.,J  |     |                   |
| ~L'lo .U'i ip     | \w,. ,1n~  | H:aume-\m1lntt  | { ,111<lanc-r     |     |                   |
| KttommendahOM     |            |                 |                   |     | Technology Used:  |
\\'orkflow
Python, LangChain, FastAPI / Flask
|     | --+- | •  --+- |     | Vector Database (FAISS / Chroma),  |     |
| --- | ---- | ------- | --- | ---------------------------------- | --- |
u. ., .
|     | Rcgiotcralion/  | l'rome  | Chatbot   |     | MERN Stack  |
| --- | --------------- | ------- | --------- | --- | ----------- |
|     | Login           | Setup   | Guidance  |     |             |
l
Supervisor Name:
***
|                        | •  .,._         | 1' --+-      |           |     | Ms. Saira Qamar  |
| ---------------------- | --------------- | ------------ | --------- | --- | ---------------- |
| enivonity/Scholrn,hip  |                 | l:pload SOP  | Document  |     |                  |
|                        | Recommendation  | & Resume     | AnalysiJ  |     |                  |
Group Members:
Maryum Fasih (i22 - 0756)
Ms. Sein Qomar
Mahum Hamid (i22 -1009)
Muneeb ur Rehman (i22 -1017)

FAST NUCES ISLAMABAD CAMPUS

DocTriage
A doctor-first clinical support platform that embeds Al assistance directly into hospital ward
workflows to streamline triage, documentation, and clinical review. Built on the MERN stack
(MongoDB, Express.js, React, Node.js), the system integrates a Retrieval-Augmented Generation
(RAG) pipeline to produce evidence-grounded clinical summaries from patient records and medical
knowledge sources. Trained models power the diagnosis support engine and multimodal lab report
analyzer, enabling structured interpretation of symptoms, reports, and scans while performing
drug-interaction and seasonal trend checks. Key features include LLM-assisted smart triage with
auto-filled forms, a voice-to-structured-data pipeline for converting spoken notes into standardized
clinical records, and an interactive dashboard for ward-level monitoring. The expected outcome is
faster, more consistent clinical documentation and decision support that augments doctors'
judgment, reduces manual workload, and improves workflow efficiency without replacing clinical
authority.
.r""'-
DocTriage l~ ·
..........J
Supervlso,.
A do«o,...fl"'t Al ~ttorm built on t>tAUlffSl'IIAllat
the Mt::RN stack that streo.mllni:, Group Members
triat•, dOOJrrMtntallon. and lab Kesh(l(hwl 22:1 010.3
revie·N using RAG and fine-tuned Han!ya 22i-l0Sl
BERT modet.s. augment1ng, nol H1qnq Rl.oll"Mn 22i (»17
r~acln1, cUnlcal Clecl51on-
matlng
42Mii4i •••
O~~~tr::• )
T•I•·•
Now un, Smart
~@
+ ~
~.,
lrdtlM dlqnoll• k-U g - e •u ne p r a q t '- o '< r H tlon L.l.l.l.b.. ..-. port Technology Used:
MMfiii,iW
MERN stack (MongoDB, Express.js, React,
___
--- NOV • DSC APA - JUN Node.js), TensorFlo
-
I..T...-.E...f.- t.- ol -.T-I
.
O
.
N
.
t
-
s...,,~,.. .
I). .....- ...
- -- Supervisor Name:
'AooCl<IIIWl:iiN .....
Dr. Ali Zeeshan ljaz
ITIR,t,TION •
SIP - OCT
Group Members:
JAN• MAR
Haniya Sajjad (i22 - 1081)
Haqeeq Ruman (i22 - 0917)
Kashf Khan (i22 - 0793)
FAST NUCES ISLAMABAD CAMPUS

F25-195-D-DeepBlight: Al Powered Potato Leaf Diseases and Pest
Detection
DeepBlight is an Al-powered system designed to assist farmers in the early detection of potato leaf
diseases and pests using deep learning. The project includes an Android application that allows
users to capture or upload images of potato leaves or pests and receive instant diagnostic results
along with treatment recommendations. The system employs a deep learning model based on
DenseNet to accurately classify multiple potato diseases (such as early blight, late blight, verticillium
wilt, and leaf roll disease) and pests. The backend services are integrated with cloud deployment to
process predictions and store scan history using MongoDB. Additional features include a weather
forecast module to provide crop-care insights and a Plant Growth Center that offers information
about plant diseases and favorable growth conditions. The system is developed using technologies
such as Python, TensorFlow, Android Studio, Katlin, Docker, AWS, and MongoDB. DeepBlight aims
to provide a practical, accessible, and reliable digital tool that helps farmers make informed
decisions, reduce crop loss, and improve agricultural productivity.
Technology Used:
Android Studio, React, Python, Deep Learning,
Java, AWS, Docker, Tensorflow
Supervisor Name:
Dr. Labiba Fahad
Group Members:
Muhammad Sarmad (i22 - 0941)
Muhammad Umar Hassan (i22 - 0942)
Muhammad Huzaifa(i22 -1220)
FAST NUCES ISLAMABAD CAMPUS

RANSIGHT
RANSIGHT is an Al-driven research project proposing a hybrid deep-learning framework for
proactive ransomware detection. The system is designed to identify advanced and evasive
ransomware variants, such as "living-of-the-land" attacks, which often bypass traditional signature-
based security measures. There are 2 primary analysis streams in this framework - Static Analysis
and Dynamic Analysis - the former converts binaries into 2D grayscale images to be processed by
a Convolutional Neural Network (CNN) for structural pattern recognition. The latter monitors
sequential behavioral traces, including memory usage and Command & Control (C2) traffic, using
Long-Short Term Memory (LSTM) networks to capture malicious activities overtime. If the system
detects a threat it utilizes an explainability layer to provide transparency regarding the detection.
Features include:
Hybrid Multi-Input Detection: Fuses spatial features from static binaries and temporal features
from live execution traces for high-accuracy classification.
Explainable Al (XAI) Integration: Incorporate SHAP and LIME to explain the reasoning behind the
model's decisions.
Real-Time Behavioral Monitoring: Analyzes sequential data points such as API calls and network
traffic to catch ransomware during encryption phase.
Key Words:
• Hybrid Deep Learning
• Convolutional Neural Network (CNN)
• Long-Short Term Memory (LSTM)
• Explainable Al (XAI)
•
, RANSight
Empowering orgonizotlons to proactively identify and defend
against ransomware threats.
SYST M AR HITECTURE
Whot Is the rtsk: level for
our soies dotobose?
DEVELOPMENT Tl MELINE Technology Used:
Python, SHAP, LIME, Tensor flow, CNN, LSTM
Visual Studio
Supervisor Name:
Dr. Sana Aurangzeb
Sep: Oct: Nov. Apr:
Group Members:
.TE,C.H NOLOGIES PROJECT TEAM
122-0611 Bilal Naveed Bilal Naveed (i22 - 0811)
--., TensorFlow Jupyter 122-1050 Umor Javed
122-~568 Adool Holdor
G
,. SHAP PROJECT SUPERVISOR Umar Javed (i22 - 1050)
Or. Sana Aurangzeb
Or, Qoiser Shafi
Adeel Haider (i22 - 2568)
FAST NUCES ISLAMABAD CAMPUS

Digital Twin
An intelligent meeting automation platform is being developed, designed for professionals
managing multiple virtual meetings. The system provides automated meeting participation through
Al-powered bots that join meetings, record sessions, transcribe conversations, and generate
intelligent summaries using a custom fine-tuned FLAN-TS model. The platform integrates with
Google Calendar for automatic meeting detection. Users authenticate via Google OAuth 2.0,
schedule meetings or sync with their calendar, and the bot automatically joins, records, and
processes meetings. After completion, users receive Al-generated summaries with extracted action
items. The system uses FastAPI backend with PostgreSQL database, Next.js frontend with
Typescript, and background task processing via Celery for asynchronous operations like
transcription and summarization.
Features include:
Automated meeting bot deployment and hands-free participation
Video recording and local storage with MP4 format support
Real-time meeting transcription generation with formatted output
Al-powered summarization using custom fine-tuned FLAN-TS model for intelligent
summaries and action item extraction
Google Calendar integration for automatic meeting detection and synchronization
Secure OAuth 2.0 authentication with Google for passwordless login
Background task processing using Celery for asynchronous operations
RAG system with vector database for semantic search across meeting history
Mobile application for cross-platform meeting management
Key Words: FastAPI, FLAN-TS, RAG, PostgreSQL, OAuth 2.0
Technology Used:
DigitalTwin Backend: Python, FastAPI, SQLAlchemy,
FAST-NUCES
lsbm,bad Alembic, PostgreSQL, Celery, Redis, PyTorch,
Al-powered meeting automation platform with automated participation, Transformers, PEFT, FLAN-TS, Pydantic, ASGI,
recording. transct1ption, •nd intell gent summ•rization
Uvicorn
Frontend: JavaScript, Typescript, Next.js,
React, Tailwind CSS, HTML, CSS
External Services/A Pls: Google OAuth 2.0,
Google Calendar API, Gmail API
Infrastructure: Redis, PostgreSQL
Bot sch<duled
for 10:30AM Al/ML: Transformers, PyTorch, PEFT, FLAN-TS,
Vector Database, RAG (Retrieval-Augmented
Generation), Embeddings, Document Chunking
Supervisor Name:
Ms. Hira Mastoor
Group Members:
Absir Ahmed Khan (i22-0915)
Rihab Rabbani (i22-1345)
Ayna Suleman (i22-10S4)
FAST NUCES ISLAMABAD CAMPUS

Securileaf - Multimodal Plant Disease Classification
Securileaf will be a web application that will provide plant disease classification by utilizing inputs
of plant/crop disease image snapshots and text prompts that describe visually observed
symptoms, lesions, and disease spots. The application will query inference from a deep learning
based model that will be trained on a multimodal dataset containing in-the-wild plant disease
images of 89 disease class types, along with predefined textual descriptions generated by a VLM.
This model will be the product of research work, where the main gaps addressed in existing
literature will be:
• Domain difference between training on laboratory datasets and in-the-wild datasets
• Limitations of unimodal methods
• Performance drops due to high intra-class variance of visual symptoms in the same plant
disease class, and low inter-class visual discrepancies in symptoms of different classes. More
specifically, any disease of the same type can manifest itself varyingly in two plants due to
stage of the disease, local environmental conditions and complex backgrounds. Similarly, two
different plant disease types can be visually similar, making accurate classification challenging.
Multimodal capabilities allow these ambiguous visual features to be differentiable using
assistance from text descriptions which can provide refined information that cannot be
captured otherwise.
The research aims to improve upon the chosen dataset's baseline using multiple evaluation
metrics, and create a reliable diagnosis tool that can be used by farmers in real-world precision
agriculture tasks.
Securileaf"
Multimodal Plant Disease Classification
S•cur-tl•ar wlll be a w•b apptlcat:lon lhal wl'I provldo ptanL
dlMmse classft'lcatlon by utJUztng Inputs of' pt•nt/cn>p dlse:m.e
1m9ge 9,,,-p•hob cwtd te•rt pr001pts lhell c:1-=:sai~ vh.uillly
•••Ion•,
OOMn,tNJ •ymptom•. onc.l dlM•.,. •pol:#
Technology Used:
Google Colab, Python, Pytorch, React+ Typescript, .Net
-T-
c
•
l.
o
arl t
&
eo
,t
n
)'
c
8
e
1
n
1
t
g
n
h
c
l -,1.n>o.-~ ••
Web Core, SQL Server
-- - Supervisor Name:
~-,-~'
Dr. Labiba Fahad
Ott CC L
,.,_~,--
Group Members:
Coe----•• -
croaa-Allent:lon j Ahmed Ateeb 22i-1079
Faizan Shahid 22i-1235
Output Aoun Jee 22i-1052
FAST NUCES ISLAMABAD CAMPUS

Qsim
QSim bridges popular frameworks-Qiskit, Cirq, and Pennylane-through a common OpenQASM
3.0 intermediate representation, enabling unified execution across multiple simulation backends.
The platform exposes two layers: a User API for circuit submission, status queries, and result
retrieval, and a Job Manager/Backend for resource allocation, queueing, and distributed async
execution. Deployed primarily on Huawei Cloud (ECS, CCE, OBS) with selective AWS services, QSim
runs across distributed Q-Nodes on a hybrid cloud infrastructure.
Developed as 3rd place winners of the regional Huawei /CT Competition.
Features
• Format Conversion - Translates Qiskit, Cirq, and Pennylane circuits into OpenQASM 3.0
IR.
• Multiple Simulation Modes - Supports statevector, density matrix, and shot-based
backends.
• Distributed Computing - Kubernetes (Huawei CCE, EKS) orchestration offloads circuits to
Q-Nodes.
• Resource Management - Tracks CPU, GPU, and memory with priority-based scheduling.
• Fault Tolerance - Automatic rescheduling, retries, and checkpointing for reliability.
Keywords Quantum Simulation OpenQASM 3.0 Distributed Computing Huawei Cloud
Infrastructure· Interoperability
l"IINM,,.,.-.,--..:-:111-0(/A
.i3'!-~·flco::;1U ll.i'I
·~ ,.,. ....~ JM..1<1J 111,,
QSJm u.se:s OpenQASM 5,0o~ o unlw:rso! lntcrtnecllOtc rcprc.r:ntatlan, r.11::c:~ptlng n10C" ]
[ from Oi5kit. Ciro or Pt!nnyt.anll!.. t!nobllna intttror:,ttrorfbHlty on sc-olaiJlt! cloud o!ot/orm
Architecture
a--
-•
dOc:la-r
Technology Used:
Python · OpenQASM 3.0 · FastAPI · Qiskit · Cirq
Timeline · Pennylane · Huawei ECS/CCE/OBS ·
©
PostgreSQL · RabbitMQ · Prometheus · Grafana
Supervisor Name:
lel>t•Oct Nov• Oec
Dr. lmran Ashraf
Tools & Technologies Group Members:
Abdullah Mehmood (22i-0978)
Abeer Noor (22i-1122)
Aneeq Ahmed Malik {22i-1167)
FAST NUCES ISLAMABAD CAMPUS

FrameForge
FrameForge is an Al-assisted anime frame generation and interpolation system designed. to
simplify and accelerate the animation production process. The system takes two key input frames
and automatically generates smooth in-between frames using deep lea.ming techniques.
FrameForge focuses on assisting digital artists and animation creators by reducing the manual
effort required in traditional frame-by-frame animation workflows.
The system architecture consists of a frontend intetface and a cloud-ha-;ed AT processing pipeline.
The frontend (planned using Next.js) allows users to upload struting and ending frames. The
request is then processed through a GPU-enab]ed cloud environment (RunPod), where the
ToonCrafter deep ]earning model generates intermediate frames while preserving the aitistic style.
The generated frames are returned to the user as a smooth animation sequence.
The goal of FrameF orge is not to replace artists, hut to enhance productivity, reduce production
time, and make animation technology more accessible to independent creators and studios.
Features include:
• AI-based frame interpolation from two keyfrarnes
• Style-preserving anirne animation generation
• Cloud GPU-accelerated processing
• Scalable model execution via API integration
• Automated in-between frame generation
Keywords: Artificial Intelligence, Deep Learning, Frame Interpolation, ToonCrafter, Cloud GPU
Computing
:--Oupcrvl-.or, M,·"· Rnl..,t11I 7nh. .J
Sulf'ur Rchl'lu,n -221-092.1
H.uhu,.,-. Khul,J 22, I OJ.<I
!!'hmd /\1:,dulluh 22i• I 043
Al-A-I~ Anhne fi'.-.n1•
Gener•Uons ,a-..n1;d,.., . .
PROBLEM MOTIVATION
•n,.,,. c-.,,,.. ..., ..., . ••d t_ .. .,.,,. 1.,,,.,.,.1.,., ...,_1..-1 d!Mll'"I ••••hi,. ln"••d or ,-.,p1,..,1t,,c ,h,.n,
loooJotp•,.•:f ... ,, C'.._,.,.,..., l,oCI" •"""°'" ••• ,.,.,,1,. lt<>0·l1.1"'.-1or,n•luetl,.n tlnw,
~TIO~
Key Feat:u res Technology Used:
Python, Pytorch, Runpod, Next.js
Cloud C.1-'U uccclcr111lon Supervisor Name:
St:'411'11:U.:-fllOdel cxccutlOII
Mrs. Ra bail Zahid
Group Members:
TOOLS AND TECHNOLOGIES
Saif-ur-Rehman (i22 - 0923)
'IN!D S1lloelk
.1 ,
,
..,..,. .. . ,.0
, .
'•
,
"
,
I'
'
......
I
I
•
I
•
"'
I
-•
' •
uoO
•
I
'
n
"
o.
'
r
"
•
"
'" "
I
"
t
-.
O
1 I
•
1,
•
~,
•
•
• •,
Rohaan Khalid (i22 - 1034)
Saad Abdullah (i22 -1045)
6 mg
FAST NUCES ISLAMABAD CAMPUS

Acceletron
The project aims to make accelerator-based programming more accessible to all programmers and
less cumbersome for experts. It provides a one-click solution that transforms a serial program into
a parallel implementation capable of leveraging the power of a system's GPU to achieve
significantly faster execution. It fully automates the process of measuring and analyzing the
performance of a source program-an otherwise tedious task traditionally performed manually by
developers. State-of-the-art profiling tools are used to assess CPU and memory usage. This
performance data, combined with the target system's specifications and knowledge of established
optimization techniques, is used to generate detailed natural language prompts. These prompts,
along with the original source code, are passed to the core of the application: an LLM fine-tuned
on curated pairs of serial and parallel code sourced from publicly available datasets. The LLM
generates multiple parallel versions of the input program. Each version is then evaluated for
performance and resource utilization. Finally, the application presents the results to the user,
highlighting the best-performing accelerator-based implementation.
Key Words: High Performance Computing, GPUs, LLMs, Finetuning, Code Generation
I'?.
Acceletron
Profile . Translate . Validate
Acceletron democratizes GPU programming. It profiles your C
code nt runtime, extrncts optimization insights, and guides nn
LLM to generate efficient CUDA imp ementations driven by
dynmaic profiling. Automatic benchmarking. Best version wins.
)
Technology Used:
Profiling
Python, gprof, CUDA, vLLM, React, FastAPI
Supervisor Name:
Dr. lmran Ashraf
Prompt
.........
Group Members:
~Jl
-> Faiz-ul-Hasan (221-0818)
ifr@:#i
Jawad Ahmad Khan (221-0791)
Validation
Tools and Technology Supervisor Faris Ali (221-0804
Dr. lmran Ashraf
Team
Faiz Ul Hassar 12 21·0818 )
Faris ( ?71·0804 J
Jawad Ahmad Khan ( 221-0791 )
FAST NUCES ISLAMABAD CAMPUS

Raahi Al
Raahi Al - An Al-Powered Travel Companion is being made, whilst keeping the perspective of
travelers planning safe trips in Pakistan's northern regions. There are three major modules of this
system - Itinerary Generation, Data Services, and User Interface - the first is for the system to
process user constraints like budget and duration to generate optimized multi-day travel plans.
The second integrates external APls for weather forecasting and route estimation to ensure
reliability. The latter is for the users, who will interact with a responsive platform for preference
input and map-based route visualization.
Features include:
-Al-based personalized itinerary generation using CSP.
- Real-time weather integration and safety-aware scheduling.
- Budget-based destination filtering and route sequencing.
- Interactive map visualization with plotted POis.
- Persistent storage using Firebase Firestore.
Key words: Constraint Satisfaction Problem, Microservices Architecture, Firebase Firestore,
OpenWeatherMap API, Travel Optimization
e
RAAHI AI
An Al-Powered Travel Companion for Safe and Efficient
Itinerary Planning in Pakistan
Technology Used:
Python, FastAPI, Firebase Firestore,
OpenWeatherMap API, Google Maps Platform,
Visual Studio Code
Su ervisor Name:
Ms. Marium Hida
December lanuary /
Febtuery Grou Members:
PIIIJE CTTOOLS
TEAM MEMBEIIS
0 FastAPI python· 1220960Taha Khahro Taha Khahro (i22 -0960)
, • F1,eb,,,., 1221059 Saad Aamir
· , ,I!. "' ,.~ () 1221209 Ahmed Raza Ahmed Raza (i22 - 1209)
"";."-"'°"'-0 ~-•""'"• V GitHub Supervisor: Ms. Marium Hida
Saad Aamir (i22 -1059)
FAST NUCES ISLAMABAD CAMPUS

Pose2Play - VR-Based Adaptive Rehabilitation System
Pose2Play transforms traditional rehabilitation into an interactive gaming experience. By
combining computer vision and virtual reality, the system turns repetitive therapy exercises into
engaging VR mini-games powered by real-time movement tracking. Using just a standard webcam,
Pose2Play analyzes body posture, detects incorrect form, and delivers instant corrective feedback.
Its adaptive engine automatically adjusts difficulty based on performance, creating a personalized
and motivating recovery journey. A built-in analytics dashboard tracks progress, accuracy, and
range of motion over time. Pose2Play showcases how Al, VR, and gamification can work together
to make rehabilitation smarter, more accessible, and more engaging.
Features include:
- Real-time Al pose tracking & posture correction
- Adaptive difficulty with instant corrective feedback
- lmmersive VR mini-games for rehabilitation
- Live performance tracking & progress insights
--- .
Key Words: Virtual Reality, Computer Vision, Adaptive Machine Learning, Pose Estimation, Gamification
~ . SUpentsor • Mcnmooa
• co S1.1pc.r,.1.u.r, M. .r .u.s.a..n.a 111•nran
POSE2PLAY a,aa• 1ria. 221-0832
Mln.111h11lll22l---OS49
ruu11M1 Haman 221 0~43
-•1~11- Dbieclive
• To design a Pf"Olotype rer.&b,Utat1on
pletform ~ t lntegret•• compo..rt-vo•lon,
• e ad n • h p a • n h c • e • m ••• o r u n v t a n t g lo , • n n . e d n V s R u g re a c m o lf r i r C e • c t t i o fo n r 1 m 0 .
and auppon. atfactfva r•c.,.,.,_y for an
.ngagl~. eccesalt>le renao e1<p,er1ance.
Technology Used:
Python, C#, MediaPipe, Pytorch, Flask, Unity,
Fire base
eTI MEL·I NE Su ervisor Name:
e ee1..;pq1+~
·§ ~:-~=·- :
~=:.. .. Dr. Tajwar Mehmood
: ~.= PAequl.i11on : !::~~Tr:.i:L-rnlno •
• A,-chh-•-•o..l~ •• e ~, _: ta : . : .l _: fl ; c o • n t1 ; ,.1o _nn .o, _1.,. .. •• = - , .~- .. . .. ~. . . . .-, c . 1 . oo , I.1o ... :• :SO =....•.: •u ;pS : • - o .\ • '; - '~ • • Mr. Usama Bin lmran
fnta9,a1!on ~,.,..•
Group Members:
Ayaan Khan (i22 -0832)
Minahil Ali (i22 -0849)
Ahmed Hannan (i22 -0943)
FAST NUCES ISLAMABAD CAMPUS

CRYVEX
CRYVEX is a blockchain-enabled ETL pipeline tracker designed for organizations handling sensitive
data in regulated industries such as Banking, Cryptocurrency, and Healthcare.
The Data Engineer view allows users to configure ETL pipelines, define transformation rules,
schedule executions, and monitor real-time processing status.
The Auditor view enables compliance personnel to verify data integrity by comparing current
hashes against blockchain-stored hashes and generate compliance reports for PCI DSS and HIPAA.
The System automatically generates SHA-256 hashes at each ETL stage and stores them immutably
on Ethereum blockchain via smart contracts.
Features include:
• Multi-domain ETL processing with domain-specific transformation rules
• Blockchain-backed cryptographic verification with Merkle tree gas optimization
• Real-time monitoring dashboard with alerts
• Immutable audit trails for regulatory compliance
• Tamper detection and rollback capabilities
Keywords: Blockchain, ETL Pipeline, Data Integrity, Smart Contracts, Cryptographic Hashing
Technology Used:
Python Apache Airflow Apache Kafka
PostgreSQL Ethereum Solidity React Docker
Supervisor Name:
Ms. Urooj Ghani
Group Members:
Muhammad Sohaib (i22 - 0879)
Hamdan Sajid (i22 - 0872)
Hussnain-ul-Abidin (i22 -1102)
FAST NUCES ISLAMABAD CAMPUS

Khadim
Khadim is an Al-powered, multi-agent conversational system designed to automate the restaurant
ordering experience and reduce dependency on human waiters. The idea stems from a real and
widespread challenge where restaurants today struggle with rising labor costs, staff shortages, and
the growing customer demand for faster, more personalized service. Khadim addresses this by
acting as a virtual Al waiter, allowing customers to order directly from their tables through natural
conversation in English or Urdu via voice or text, enabling restaurants to operate efficiently around
the clock even with minimal labor. Packaged as a Saas solution, Khadim is designed to be accessible
and  affordable  for  restaurants  of  all  sizes,  bridging  the  gap  between  automation  and
personalization for both customers and restaurant owners.
Features include:
- Voice ordering in natural language like Urdu
- Upselling engine to boost sales by recommending items according to the weather and events
- Personalization engine to produce offers based on user preferences
- Custom deals creation for users to adjust specific group size or cuisine types
- Real-time kitchen routing that instantly displays incoming orders on the kitchen screen
Key Words: Multi-agent System, Large Language Models, Conversational Al, Restaurant Automation
Supervisor;
Or. Akhtar Jamil
Co-Supervisor:
Mr Us:ama lmti::ii,z
To~m Mombor-s:
Ahmed Naveed-221-1132
| KHADIM  |     |     | S • r i   | m  R M . h e e d   -2 21 - 12 8 0  |     |     |
| ------- | --- | --- | --------- | ---------------------------------- | --- | --- |
|         |     |     | l-4 a r b | i U s n u i n  - , ~ -0 5 2 7      |     |     |
Al-Powered Restaurant
Automation Platform
PROBLEM STATEMENT
Restaurants often strusgle with Ions customer waitins times,
order mismanogement durins peak hours, and inefficient kitc-
hen cc:10n::finatioo. Traditional. ordering system:. lack intelligent
recommendation capabilities and personalized customer
interaction, re5'.Ating in reduced OPerationail efficiencvi v'ld poor
customer experience.
Technology Used:
KEY FEATURES
Python, LangChain, FastAPI, Flutter,
| .-._ Voice & Text  |           |     | Pef'sorialized     |     |     |     |
| ------------------ | --------- | --- | ------------------ | --- | --- | --- |
|                    | Ordering  |     | Recommendation::.  |     |     |     |
c ...... tom.,. c.a" pbc. ~•  Al ~•m•mber• cu•to..,,..,- PostgreSQL, Redis, Docker, Whisper
|     | u .. uua,t, , ..l ul' •I vvi<:.•  |     | P-•'··••K~•d.u~lOll'm  |     |     |     |
| --- | --------------------------------- | --- | ---------------------- | --- | --- | --- |
Of text tflpuL
|     | Al Order    |     | Secu.-e Digital  |     |     |     |
| --- | ----------- | --- | ---------------- | --- | --- | --- |
|     | Management  |     | Payments         |     |     |     |
Al a.gents man--ae orders  U'lt•~tea payment system  Supervisor Name:
|     | and opth1be order ~ndlne.  |     | for safe transactions.  |     |     |     |
| --- | -------------------------- | --- | ----------------------- | --- | --- | --- |
|     | Bilingual                  |     | Real-Time               |     |     |     |
Dr. Akhtar Jamil
|     | Interaction              |     | Analytic:s.            |     |     |     |
| --- | ------------------------ | --- | ---------------------- | --- | --- | --- |
|     | $upporu bot.h vrou, and  |     | R•ttaur..-it-!"S<:..-- |     |     |     |
e :n al l s h  w i t h  loc;;•ll~~  n , ,g nl l~;c.o..-r u en c. n . t t a nds  Group Members:
|     | in te r a c tl o n .   |     | a n d   | m a n c • .   |     |     |
| --- | ---------------------- | --- | ------- | ------------- | --- | --- |
SYSTEM WORKFLOW
| ~~-:0~,t-~ch-!9-~  |     |     |     |     | Ahmed Naveed (i22 - | 1132)  |
| ------------------ | --- | --- | --- | --- | ------------------- | ------ |
~ -JL.
|                  |              |                        |        |           | Haris Usman (i22 -         | 0527)  |
| ---------------- | ------------ | ---------------------- | ------ | --------- | -------------------------- | ------ |
| Loain            | Order Input  | ~ nt &  Proe•~a        |        | Qouc-i"8  |                            |        |
|                  |              | Genef11.tton.          |        | Syscem    |                            |        |
| ..               | ~            | . . , . 1              | 9 •    | 0         |                            |        |
|                  | TOO          | LS  &  T ECH           | N OLOG | IES       | Sarim Rasheed (i22 -1280)  |        |
| Python J:luttor  |              | Doekor  Poct~OL Rodie  |        | PyToreh   |                            |        |

FAST NUCES ISLAMABAD CAMPUS

ZimedarDrive
ZimedarDrive is an Al-powered traffic violation detection and road hazard reporting system built as
an Android application with a Django backend. The app uses a YOLOvllL deep learning model
(mAP@0.5: 0.865) to detect traffic violations from camera feeds in real time. It targets the growing
need for automated traffic enforcement in Pakistan, where manual monitoring is insufficient for
the scale of violations occurring daily. The system captures violations, classifies them, and logs
evidence with timestamps and location data for law enforcement review. Additionally,
ZimedarDrive enables community-driven hazard reporting with live route adjustment capabilities
and provides authorities with a centralised dashboard featuring violation analytics and heatmaps.
Features include:
• Real-time traffic violation detection using the YOLOvlll object detection model trained on
Pakistani road conditions.
• Dynamic violation classification with object tracking for multi-frame evidence capture.
• GPS-tagged violation reports with timestamp and photographic evidence for law
enforcement.
• Community-driven hazard reporting allows users to report road hazards (accidents,
potholes, roadblocks) with geo-tagged photos and descriptions.
• Live route adjustment that dynamically reroutes drivers around reported hazards and
high-violation zones in real time.
• Authority dashboard with a centralised view of all reported hazards and violations,
interactive heatmaps for hotspot identification, and analytics for data-driven traffic
enforcement.
• Key Words: YOLOv11, Object Detection, Traffic Violation, Hazard Reporting, Deep
Learning
imedarDrive.
To make the roads of Pakistan safer through a mobile based application for
automated vlolatlon detection, Uve hazard alerts and crowa-sourced analytics.
Architecture Diagram
Q.OU)U:llYEA&tL\t,UU,IE
Technology Used:
---·
Katlin, XML, Django, Python,
..........
YOLOvllL, OpenCV, CameraX, TensorFlow,
Project Timeline Torch, Google ML Kit, Postgres, SQLite
r- Dat ( a lt s e e r t a c t o io 1 n 1e 1 c ) t on ,-- S -. t . a . t ( k It M er o a d ti e o l n T r 2 a ) i ning Dy . n f.l a t. n e, k r,. : 1. V .ti. i o O .n. l . l 3 l , tk ). l nS - Moa Ut t, 1 N O a p 6 U o m n l 4 ta J t lon Supervisor Name:
Al'Wl Prl!ll)tOC. ..l ff'O
ffi~ Dr. Faisal Cheema
o-- o , o---•
_.,.., Group Members:
• Stltie MOdel - Wtb Dashboard
Protor;plno lnlertllQll ,Gn Mobrt lnt90r11tkwl
CF.A;~~ -"'"""'""'' Muhammad Daniyal Aziz (221-0753)
- E M •O n 'ff . l O a ie r i d n f R f c l e c fl C P .U ( d Q ll l ' e f 1 l c in lk g :i a n n d T D e on e i m yo M l A e 7 m i7 b ? e ? r i- s 0 753 Hussain Ali Zaidi (221-0902)
_T_o_o_ls-: -------- ---MuhnmmodAli ??'i-OA?7
I• -·
Hussain Ali 7oidi ??i-()q{)? Muhammad Ali (221-0827)
~-1' 1~~~:~:~heemo
! !t m- j[ "- -ti, -'I' l
O·---· l 6- .,._ ..__H lk'- KOD lnb. FAST Nl.lCES
FAST NUCES ISLAMABAD CAMPUS

|     |     |     |     | DentAssistAI - |     | Dental Assistant Suite  |     |     |     |     |
| --- | --- | --- | --- | -------------- | --- | ----------------------- | --- | --- | --- | --- |
DentAssistAI is an Al-powered dental diagnostic and reporting system designed to assist dentists,
patients, and clinic administrators in analyzing dental radiographs and managing treatment
records. The system automates radiograph interpretation using multiple Al models while
providing structured reporting and secure access to data.
There are three views of the system: Dentist View, Patient View, and Ad min View. The Dentist
View allows dentists to upload radiographs, run Al analyses, review and update annotations, and
generate PDF reports, while the Al models perform teeth segmentation, detect previous
treatments (crowns, fillings, root canals, implants), classify implant brands, and predict the need
for apicoectomy. The Patient View provides secure access to diagnostic reports and treatment
history, ensuring clarity and privacy, whereas the Admin View supports user account
management and system activity monitoring to maintain smooth and secure platform operation.
Features include:
•  Automated teeth segmentation from radiographs for structured per-tooth analysis .
•  Detection of previous dental treatments including crowns, fillings, root canals, posts,
bridges, and implants.
•  Implant brand classification for compatibility and treatment planning .
•
Apicoectomy need prediction to assist dentists in surgical decision-making.
•  Secure radiograph upload, Al-based analysis, and report generation .
•  Role-based access control and structured database storage
Key Words: Dental Diagnostics, Web App, Artificial Intelligence, Radiograph Analysis
| Team Members:  |     |     |     |     |     | .._.1.1  |     |     |     |     |
| -------------- | --- | --- | --- | --- | --- | -------- | --- | --- | --- | --- |
22i-0957  Ayishah
22i-1044  Mohib tttikhar
|                         |     |     | DentAssistAI  |     |     | Supervisor:         |     |     |     |     |
| ----------------------- | --- | --- | ------------- | --- | --- | ------------------- | --- | --- | --- | --- |
| 22i-1217 Maryam Forooq  |     |     |               |     |     | Ms Moryorn Shahbaz  |     |     |     |     |
An Al-assisted dental diagnostic system thot analyzes radiograph and
generates clinician ready reports.
*
|     |                 | --A-rch-itectu-re  |     |     | -:- |          |     |     |     |     |
| --- | --------------- | ------------------ | --- | --- | --- | -------- | --- | --- | --- | --- |
|     |                 |                    |     | J;  | •   | c-rc;-"  |     |     |     |     |
|     |                 | lg                 |     |     |     | ']       |     |     |     |     |
|     | ,_,,,...,.,_.1  |                    |     | I   | I   | l        |     |     |     |     |
t ""-
| ~-  |     | ~ - | rm  | -   | &   |     |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
ID'
| w~  | ..... ...,.~  |     | ~...._.msn,.  |     | ~•  ,--11...-i  |     |     |     |                   |     |
| --- | ------------- | --- | ------------- | --- | --------------- | --- | --- | --- | ----------------- | --- |
|     |               |     |               |     |                 | t   |     |     | Technology Used:  |     |
I
|     | -   | n, -&  |     |     | l=1  |     | REST APls, React, Supabase, PostgreSQL,  |     |     |     |
| --- | --- | ------ | --- | --- | ---- | --- | ---------------------------------------- | --- | --- | --- |
YOLOv8, SAM, BB-UNET, PyTorch
|     | 0.AaltrwtaJ  |     | ~b--,.t:9"".4.«-ts M.....,,,.._._tilitTf  |     |     |     |     |     |     |     |
| --- | ------------ | --- | ----------------------------------------- | --- | --- | --- | --- | --- | --- | --- |
I
Supervisor Name:
0 Timeline
|     |          | 0                       | ·-               |                               | 0                     | 0                              |     |     |                     |                    |
| --- | -------- | ----------------------- | ---------------- | ----------------------------- | --------------------- | ------------------------------ | --- | --- | ------------------- | ------------------ |
|     |          |                         | -                | --                            |                       |                                |     |     | Ms. Maryam Shahbaz  |                    |
|     | S        | e p - O c t             | N o              | v o e c                       | , _J a n  - f a i b   | · -- M a r - · A p r           |     |     |                     |                    |
|     | ·• -     |                         |                  |                               | .                     |                                |     |     |                     |                    |
|     | l k l    | t a e o l e e t i o n   | -                |                               | - t a t l o n         |                                |     |     |                     |                    |
|     | •  T r ~ |                         |                  |                               | -                     |                                |     |     | G r o u p           |   M e m b e rs :   |
|     | " " "    | ' ' " " " " " " "       |   •   - O lt l " | l t l l t f l r o rl O IU I   | " " " "               |                                |     |     |                     |                    |
|     | . . .    | . . . "                 |                  |                               |                       | •  . - . . g a t i o r lo na   |     |     |                     |                    |
" " " " " '" " '   •  F a d e n c l ' o t t a ! U I   •  ~ f 'O r t O IU I  T • l l n g   A yi s h ah   ( i2 2  - 09 5 7 )
|     |     |     |     |     |     |     |     | Mohib Ullah lftikhar (i22 - |     | 1044)  |
| --- | --- | --- | --- | --- | --- | --- | --- | --------------------------- | --- | ------ |
Tools& Tech
|     | 0   |          | Ill  | V            |     | @   |     |                            |     |     |
| --- | --- | -------- | ---- | ------------ | --- | --- | --- | -------------------------- | --- | --- |
| 0   |     | PyTorch  |      | ultrolytics  |     |     |     | Maryam Farooq (i22 -1217)  |     |     |
YOLO'fl

FAST NUCES ISLAMABAD CAMPUS

RWAchain - Real World Asset Tokenization Platform
RWAchain is a blockchain-based real estate tokenization platform designed to enable fractional
property investment through secure smart contracts. The system allows property owners to
tokenize real-world real estate assets into digital tokens, enabling investors to purchase fractional
ownership securely and transparently.
The platform integrates blockchain technology to ensure immutability, transparency, and
automated revenue distribution. Investors can monitor their portfolio, track transactions, receive
automated payouts, and participate in secondary market trading. Security features such as
encryption, authentication, and audit logging ensure regulatory compliance and investor trust.
Features include:
• Property listing and tokenization using smart contracts
• Fractional ownership and secure token purchase
• Automated revenue distribution system
• Investor dashboard with portfolio and performance tracking
• Transaction history and audit logs
• Secondary market trading (Buy/Sell tokens)
• Order book and trade history management
• Wallet integration (e.g., MetaMask)
• Secure authentication and role-based access control
Key Words: Blockchain, Smart Contracts, Real Estate Tokenization, PERN Stack, Decentralized Finance
(DeFi)
•wc ••·l>"X•,._,~r-.o~or..,--.ar,~~
,ftv,tti,....,t_ ...t O<TIMM'9\..,.ut0'1t1'butl<M'l.-iG""-no
Platform Overview
Secure T,anuction Smart Contracts
.
.
.
~-.----
"r.:-•-•- ...
?r'l \I, Technology Used:
e React.js, Tailwind CSS, Node.js, Express.js,
~ --~-!.0a
__,, ___ ,..,_ ----· - -··- PostgreSQL, Smart Contracts (Solidity), Wallet
.. Integration, Git, GitHub, Docker (basic), Vercel
Deployment
®
• NOCMJS
"' 0 Supervisor Name:
l~PS Ch4",1L.Jnk Mr. Muhammad Aamir Guizar
Group Members:
Ammar Ahmad (i22 -1267)
Hasan Murtaza (i22 -1110)
FAST NUCES ISLAMABAD CAMPUS

Flow lance
Flowlance is being developed as an intelligent freelance management platform, keeping the perspective of
freelancers in Pakistan's digital economy. This system is designed primarily for freelancers to manage their
financial, operational, and compliance activities through a unified dashboard. Freelancers can aggregate
earnings from multiple platforms and payment gateways, track expenses, generate invoices, calculate
taxes according to Federal Board of Revenue (FBR) regulations, and manage client interactions in one
centralized environment. The platform reduces dependency on manual spreadsheets and fragmented tools
by offering automated workflows and Al-powered assistance. If any Al-generated suggestion or tax
estimation does not meet user expectations, freelancers can manually adjust entries and refine records to
maintain accuracy. The system ensures secure authentication, structured financial tracking, and intelligent
automation tailored specifically to freelance work processes.
Features include:
• Centralized aggregation of freelance income from multiple platforms and payment gateways with
standardized financial records.
• Automated tax calculation engine based on FBR preferential tax rates and PRC validation support.
• Al-powered proposal writing, messaging assistance, and gig management capabilities.
• Dashboard analytics for income trends, expense categorization, invoice generation, and tax
projections.
• Secure OAuth-based integrations and hybrid data import methods (CSV/email parsing) where AP ls
are limited.
Key Words: Agentic Al, Artificial Intelligence, Tax Automation, API Integration, Freelance Management,
Financial Analytics
Technology Used:
React.js, Node.js, Express.js, MongoDB Atlas,
Python, Hugging Face Transformers, RAG,
LoRA, OAuth 2.0, Visual Studio Code
Supervisor Name:
Ms. Marium Hida
Group Members:
Ali Usman (i22 - 0926)
Affan Ahmed (i22 - 0916)
Adil Nadeem (i22 - 0799)
FAST NUCES ISLAMABAD CAMPUS

FAAZ - Al Conversational Taxi Dispatch System
FAAZ is an Al-driven taxi booking assistant developed to automate call-style booking workflows
through natural language interaction. In many UK taxi operations, customers still prefer speaking
to an operator instead of using app-based booking systems. This creates dependency on human
dispatch staff for collecting trip details, validating information, and manually entering bookings-
resulting in higher operating costs, slower response times, and limited scalability during peak
demand.
The proposed system functions as a virtual dispatcher that can understand user requests, manage
conversational flow, and complete bookings automatically. It processes user input to detect intent
and extract key ride information such as pickup point, destination, contact details, and travel time.
FAAZ then validates critical fields and records the booking in the backend database while providing
immediate, context-aware confirmation to the user.
The platform is built with a modular architecture that separates conversation handling, intent/slot
processing, booking logic, and APl/database integration. This design improves maintainability,
supports real-time interactions, and enables future expansion for advanced dispatch intelligence
and analytics.
Features include:
• Natural language-based taxi booking through conversational interaction
• Automated extraction and validation of ride details
• Real-time booking creation, status handling, and confirmation
• Modular Al architecture for scalable query processing and response generation
Key Words: Natural Language Processing, Conversational Al, Artificial Intelligence, Voice
Automation, Intelligent Dispatch Systems, Agentic Al, Cab Services, Customer Services
l
T--
---~0-.-ll'\
r~.......... . 221:a-n
-~-.... ., , :ut-~
ll1t+
•ll•l•1
FAAZ
An Intelligent volce-b•.••d booking e,gent t.ha't •utomet.•• te,.-t
res-ervatlon• u•tng rnuttlmodel NLP •nd eealabf• Al proc•••lng.,
Technology Used:
I Architecture 11111
Python, Flask, Flask-Socket, PostgreSQL
(psycopg2), Lang Chain, Open Al Whisper,
Silero VAD (PyTorch), gTTS/pyttsx3, and React
(Vite+ Tailwind CSS).
- - Supervisor Name:
.
Ms. Umarah qaseem
=. s.._c?a., :..: f :·"g--·•:-
Group Members:
····------·····-········•····-··········· ··········-·····•······
GEIS ·
Muhammad Fawaz (i22 -2340)
o1!c , Tools & Technologies Moaz Samee(i22 -2372)
Shahzaib Rauf(i22 -8220)
FAST NUCES ISLAMABAD CAMPUS

Fake Less
FakeLess is a mobile-first, proactive voice protection platform designed to prevent unauthorized
voice cloning and deepfake audio misuse.  Unlike reactive detection systems,  FakeLess applies
imperceptible,  machine-learning-driven perturbations to voice  recordings. These  perturbations
block Al-based cloning models (such  as  XTTS-v2)  while keeping the audio clear,  natural, and
intelligible  to human  listeners. The  system  prioritizes  privacy  by performing  local  on-device
processing, with optional cloud-based processing for computationally heavy tasks.
Features include:
•  Real-time Audio Protection: Users can record or upload audio to apply instant ML-optimized
perturbations.
•  Adaptive  Protection  Strategies:  Utilizes  Reinforcement  Learning  (RL)  and  GAN-based
adversarial techniques to evolve against emerging deepfake models.
•  Psychoacoustic Masking: Ensures that protective perturbations remain inaudible and do not
degrade the natural quality of the voice.
•  Customizable Protection Levels: Users can adjust the intensity of protection (Low, Medium,
High) via a slider and verify the results with a before/after comparison player.
•  Privacy-First Architecture: Implements local-first processing and secure  local  storage to
ensure voice data remains private.
•  Enterprise API Support: Provides scalable FastAPI endpoints for corporate communications
and media workflows.
Key  Words:  Deepfake  Prevention,  Voice  Cloning  Protection,  Adversarial  Perturbations,
Reinforcement Learning, Mobile Security.
| t - m  | u..,,.,..,,  |     |     |     |     |     |     |
| ------ | ------------ | --- | --- | --- | --- | --- | --- |
D M   eo~,'.~,~:.!'"""  Fakeless • An Al-Driven  Technology Used:
|     |     |     | '   | ·•I·•·  A pp roach to Combating  |     |     |     |
| --- | --- | --- | --- | -------------------------------- | --- | --- | --- |
D
-- - --- Audio Deepfakes  React Native (for cross-platform Android/iOS
Simple audio 1
|     |     |     |     | PURPOSE  | support). Python FastAPI, Flask, Redis. Pytorch,  |     |     |
| --- | --- | --- | --- | -------- | ------------------------------------------------- | --- | --- |
r•a.~isa11MJbh.f1:t1./lJS)'Sffl"11Uwt
LUMf119 YGiCrt Cioni~ USillQ adaptt-/e
User des.cribts irtent  !• i11 1 1 Cor w e rs a t 1 o ral ,  ll l "V   " "' "'  ~t lt ee h ~ ~ t d b f   Reinforcement Learning (PPO/SAC), GANs,
|     |     | 1 1   ~ I |  A g e n t   •   ~ r -        | ,   R d ~  I. Mr                               | i'l,g  ¥Id   OIJ b.  It             |     |     |
| --- | --- | --------- | ----------------------------- | ---------------------------------------------- | ----------------------------------- | --- | --- |
|     |     | f '   l   | 9 " )  a   ~ C . l< J C   •   | c a r o n e at s idp C  II U t S1I ' C l' !N ~ | ll\l I : A M~  A , t. a . f lc :w   |     |     |
ii'  I  tl . 1 \ l ' > l • ' I U l: > J .t1 o nµ•rJms  lrro r,dt i n,U u.   e.b  u d  b a c lH d  HiFiGAN. TLS 1.3, Fernet Encryption.
|     |     |     |     | .   | .   |     |     |
| --- | --- | --- | --- | --- | --- | --- | --- |
0+  M. Er9t'lt
-H•e:aV/ IOOIO  fastAPI -+ '  P r o l S < t .  . A  U O l o   Supervisor Name:
| •   |     |     |     | oo t1 1 1 t (~ ! i M U l 'l' N )   |     |     |     |
| --- | --- | --- | --- | ---------------------------------- | --- | --- | --- |
----------
Mr. Almas Khan
|     | 1   | API & lnfe-ence -                | a1d ML Engme                       |              |     |     |     |
| --- | --- | -------------------------------- | ---------------------------------- | ------------ | --- | --- | --- |
|     | f   | l! 'a tu r e   ip.:.u,.a.1,   ll | e m ,i 1 1 f 1   R L  t   u , V I  | Q u a l l v  |     |     |     |
rY t r Y l ir n   1 r 'i ~ 1 , ... , n  ln f • r • " r•   P 1r . -l ir m   Group Members:
|               | '         | '                             |                  | ,-;                |     |                                     |        |
| ------------- | --------- | ----------------------------- | ---------------- | ------------------ | --- | ----------------------------------- | ------ |
|               |           |                               | '                | <                  |     | Sameed Ahmed Siddiqui (i22 -        | 8223)  |
|               | I ~.P"C~  |                               | .....  Pv1o, h   | Pf»'TTOUUCS        |     |                                     |        |
|               |           |                               | A                |                    |     | Muhammad Nabeed Haider (i22 -0871)  |        |
| I nf  ra  ,   | •   \ h   | j )  < i , t J r c , Q L      | A   A W ~        | A 'N 3   $ 3       |     |                                     |        |
| . .t ructu    | e         | - ~   '.: i• ; i 7, 1 c .i ~  | . _  .1 ou 1  •  | s , 0  l' l '.J P  |     |                                     |        |
| -             | -- -      | -                             | - - -            |                    |     | Muhammad Tahir Sundhu (i22 -        | 0821)  |
FYP Year 202&
TOOLS & TECHNOLOGIES
|                   |            |                   | e o                 |                       |                      |     |     |
| ----------------- | ---------- | ----------------- | ------------------- | --------------------- | -------------------- | --- | --- |
| 0                 |            | ~'9 G             |                     | ·"""- " " " " '       |                      |     |     |
|                   | '-         |                   | .,.                 | u ,A l m M  KMl'i     |                      |     |     |
| FasWJI  IWd Nawt  | Flrttltl'  | ........  P!PESO  | °""Y  ...... 6itlM  |                       |                      |     |     |
|                   | "          |  -a-w-s           |                     | l .4~ 1 '1 3 d        | ~ b e cd M c td a t  |     |     |
| 0  m..l./,        |  l,o_w     |                   | G  ,1.1,~,..~,      |                       |                      |     |     |
|                   | .,.. ..    |                   |                     | U Lr uf fll U d       | lah i rS un c h J    |     |     |
| Pyla,::h          |            | '"'               | m. .  O~NX          | Samea:I AJmM SIOdlq~  |                      |     |     |

FAST NUCES ISLAMABAD CAMPUS

TwinGuard Al
TwinGuard Al framework is being made, whilst keeping the perspective of clinical staff and
cybersecurity analysts. There is a dual-layered, integrated view of this application for the clinicians
to use the features provided by our framework to monitor real-time physiological telemetry, detect
behavioral anomalies, flag sensor tampering, and generate explainable device trust scores.
Grounded in Digital Twin technology and machine learning, the system's effectiveness is validated
through extensive testing on N-BaloT, BoT-loT, WUSTL-lloT-2021, WUSTL-EHMS-2020 datasets,
proving its high predictive power and superiority over traditional transport-layer encryption in
identifying complex spoofing and denial-of-service schemes.
Features include:
• Secure edge-based intrusion detection using Digital Twin behavioral baselines for loMT
environments.
• Real-time anomaly detection through optimized Gradient Boosting (XGBoost) models
tailored for resource-constrained deployment.
• Adversarial attack simulation and telemetry validation using Node-RED orchestration and
device emulation.
• Dual-path architecture separating encrypted clinical telemetry from mirrored security
analytics to ensure zero-latency monitoring.
• Explainable, clinician-centric visualization integrating patient vitals and device trust scores
within a unified Smart Hospital interface.
Key Words: Digital Twin Security, Internet of Medical Things (loMT), Edge-Based Intrusion
Detection, Gradient Boosting (XGBoost), Explainable Healthcare Al
@t,f?[_~@
! ~ !~. . -"-~-·- TWINGUARD Al 4~
:. -v.Aa},
Behavioral Digital Twin Security for Smart Healthcare Al
' w
a
Architecture HTTK ·~
LIO - , ti I .. H .,E O T S A P V IT E Ai ~ .
~ 1.1 - ~-
- CUSSFn£R
.*& .. , .,A
l
~J P9-0 )
:
I
,
•
, !.,~:n
roGE OfVKf ..0.-l
\RASP!lt:IU!Y"II _ A :
.
caCIM.JA.SI.YJnM'QMA.WTAA lle_"1._-1.W.t.f.l.. ••• , I 81.0C:IC' IP
DEEP LE.UNINC MC0£l MA.LY/ARE !lt'M>'.Jll,.llll1 Technology Used:
(FASTAPt APPJ A~~Al
Iimeliae
C#, Python, Unity 3D, Node-RED, QEMU,
01 02 0. 04 us
XGBoost, LightGBM, SMOTE, Raspberry Pi OS,
Enw S k l 'o t n ,p m ent Pr v ea•p fi D r l o a te c ta r t i s 1 s 9 i ot lr.t M tg o r d au !I o ,1 E B n A e ei l t y e la r p t , i l t o J i l o f r j a , ' l M T r e w1 s l t i i z n a g li & oo WireGuard, TLS, tcpdump, Visual Studio
@
~ @ Supervisor Name:
nDl~l
_.._
-
Mr. Shams Farooq, Dr. Muhammad Asim
y --- _, ....., 'V'
"' § Group Members:
:ie,!«lW•~ fWIM}-11.:ri "''
Zakariya Abbas (i22-0801)
I22§ I~i!m M~mb~ciz
0 Zakarlya Abbas 1220801 Arba n Arfan (i22-0981)
PyTorch Arban Arfan 1220981
MesaamRaza 1221194
Messam Raza (i22-1194)
\M@...,
XGBoost Supervisor: Sir Shams Farooq
unity Co-Supcrvlcor: Dr. Mohammad Asi,
FAST NUCES ISLAMABAD CAMPUS

FiTribe
FiTribe is an Al and AR-powered fitness mobile application that transforms workouts into interactive
and competitive experiences. It uses computer vision and machine learning to provide real-time
posture detection and instant corrective feedback, helping users exercise safely and effectively.
Users receive personalized workout plans tailored to their goals and can track their progress with
detailed insights. The app supports various exercises and adapts to available gym equipment. It also
gamifies fitness with badges, levels, streak tracking, and interactive challenges. Social features allow
users to compete, view leaderboards, and participate in community challenges. AR-based workouts
and competitive modes make exercising engaging and interactive without needing a trainer.
Features include:
• Al-powered real-time posture detection
• Personalized workout tracking
• Equipment Recognition & Adaptive Routines
• Real-time competitive duels
• Leaderboards and achievement badges
• AR-based gamified challenges
Key Words: Artificial Intelligence, Computer Vision, Augmented Reality, Gamification, Fitness Technology
e
FiTribe
Al &A R-POWERED FITNESS MOBILE APPLICATION
To provide reel-time Al posture detection, gomlfled workouts,
and community competition to users.
ARCHITECTURE
IJIII - -
m
.....................
Technology Used:
TIMEUNE Flutter, Firebase, Node.js, Python, Socket.io,
ARCore/ARKit
Supervisor Name:
Dr. Tajwar Mehmood
Group Members:
Septembe, October November 0.C@mbe!' / F@bruory / April
January Morch
Muhammad Bilal Tariq (i22-1297)
GROUP MEMBERS
122-1297 Muhammad Bilal Tariq Muhammad Azeem Ashfaq {i22-1057)
122-1057 Muhammad Azeem AshfaQ
122-1130 Hamza Munim
SUPERVISOR Hamza Munim (i22-1130)
Or. Tajw~r Mehmood
FAST NUCES ISLAMABAD CAMPUS

Cluster-Guided LLM-Based Anonymization {CLA)
This project develops CLA, a context-aware data anonymization tool designed for students and
researchers to share Just-In-Time Software Defect Prediction (JIT-SDP) datasets without risking
sensitive information. There are two main perspectives in this workflow: the Data Provider View
and the LLM Reasoning Engine. The former allows users to input raw software commit data, which
the system automatically groups into clusters based on similar development behaviors. The latter
uses Large Language Models to interpret statistical summaries of these clusters and generate
realistic "noise" parameters. This ensures that while individual developer patterns (like daily code
churn) are masked to protect privacy, the data remains 100% functional for training Al models to
detect bugs.
Features include:
• Quantile-Based Binning: Automatically groups code commits into 200 possible clusters to
hide individual identities.
• LLM Statistical Reasoning: Uses Al to generate Gaussian Mixture and Beta distribution
parameters for realistic data mutation.
• Privacy-Utility Optimization: Achieves 18-25% higher privacy (IPR) than current state-of-
the-art methods while keeping model accuracy stable.
• Cross-Architecture Support: Compatible with various open-source models like Qwen-3,
DeepSeek, and GPT-OSS.
• Non-Invertible Perturbation: Generates new values for lines added/deleted that cannot be
traced back to the original source.
C L A
To priva11z, sensl:lve sof:Yiare connlt data through Clusttt·gvidl"d LLM·based Anor,,omlzUbn
(CL>.}to ensure prt-lac, wltho~ coni:rornlslrg ~feet predlctkH'I accuracy
Methodology_
1. Quantile 2. Cluster 3. LLM 4. Synthetic
Binning Profiling Parameterbatlon Ganoratlon
G·ouplng commits &iracting Al hfltrs reds:ic Synt"911zins
byQIDs ml!lars&ratios d~trhlon!. pri1tctecu1
Iiroelioe Technology Used:
Python, Git, Open Router, Qwen-3, VS Code
Supervisor Name:
Mr. Pir Sarni Ullah Shah
Tools Team Members Group Members:
221-2637 Gui Sher Khan ~waii Gui Sher Khan Swati (i22 - 2637)
221·2125Maaz Kha,
221·1105 Ahun Raia
Maaz Khan (i22 - 2125)
Su~ervisor
Mr. Plf SaTI U!lat Sh:it
Ahsan Raza (i22 -1105)
FAST NUCES ISLAMABAD CAMPUS

Designable Al
DesignableAI is an Al-driven platform that helps users transform hand-drawn sketches into
structured digital design insights. The system allows users to upload technical sketches offurniture
(such as chairs), after which advanced computer vision models detect individual components of the
design.
The application uses deep learning based object segmentation to identify different parts of the
sketch and extract meaningful features from them. These extracted features are then analyzed by
an Al reasoning engine which generates design insights, structural descriptions, and
recommendations.
DesignableAI bridges the gap between conceptual sketches and digital design understanding. It
allows designers, students, and engineers to quickly visualize and analyze their designs without
manually modeling them.
The platform also supports visualization enhancements such as texture mapping and design
previews, allowing users to better interpret their sketches in a digital environment.
Features Include
• Upload hand-drawn furniture sketches for Al analysis
• Automatic part segmentation using YOLOv8
• Feature extraction using computer vision models
• Al reasoning using LLaMA language model
• Texture visualization on segmented components
• Structured design report generation
• Applications for design learning and furniture prototyping
superviSor. Ms Amna lrum
Taha Faisal 221-<)815 Fahad Ahmad 221·1087
DESIGNABLE Al
DESIGN YOUR CREATTION LIKE NEVER BEFORE
THE VISION
Al driven creative platform that bridges
human unaginabon and d1g,tal design
DESIGN PHILOSOPHY
• Al analyzes designs and delivers intelligent insights
• An 1nteractJve platform for v1sua11s1ng and refining concepts
• Conlexl aware scene v1sualizalKlll
Technology Used:
SYSTEM WORKFLOW Python, Javascript, React, Node.js, Yolov8,
I Cloud Vision API, Llama Al
\v' Supervisor Name:
O UserUploadsSketch
,oco,,,±.- E
Ms. Amna I rum
Al FumHtxeAna/ySIS
-J; ,
r~ 1-------------G_r_o_u_p--,M-_e_m_b_e_rs....:,....,
'-~-' I f'rr_P Taha Faisal (i22 - 0815)
Visualization&T;><1ureApplication
® \II 'V Fahad Ahmad (i22-1087)
Cloud Vision Text Extraction
Final Report Generation
FAST NUCES ISLAMABAD CAMPUS

ElderShield: Al-Powered Elderly Safety & Wellness Monitoring System
ElderShield is an intelligent multimodal monitoring system designed to enhance the safety and
well-being of elderly individuals in hospitals, care centers, and home environments. The system
integrates Artificial Intelligence (Al), Computer Vision (CV), and loT technologies to provide real-
time monitoring, automated incident detection, and smart alert mechanisms.
The Fall Detection module uses a custom hybrid deep learning model (FaUResNet3DKeypoints)
that combines 3D temporal motion features with skeletal keypoints extracted using MediaPipe
BlazePose. This dual-stream architecture improves detection accuracy by fusing motion and
posture information to classify falls in real time.
The system also includes Inactivity Detection, which monitors prolonged sitting or lying without
movement, and Distress Gesture Recognition to identify gestures such as waving or signaling for
help. Additionally, IoT-based Environmental Hazard Detection monitors fire, smoke, and
temperature anomalies.
A web-based dashboard provides real-time camera feeds, sensor readings, incident logs, severity-
based alerts, and secure role-based access. ElderShield offers a unified, cost-effective solution for
proactive elderly care and intelligent safety monitoring.
Key Words: Artificial Intelligence, Computer Vision, loT Integration, Real-Time Monitoring, Multimodal Deep
Learning
Technology Used:
Python, PyTorch, OpenCV, MediaPipe,
Flask/FastAPI, MySQL/PostgreSQL, React
Supervisor Name:
Ms. Marium Hida
Group Members:
Muhammad Amaar khan (i22-0759)
Umar Goraya (i22-1136)
Mohammad Sooban (i22-0868)
*
FAST NUCES ISLAMABAD CAMPUS

My Al-Storybook
My Al-Storybook is an interactive story generation platform designed to bridge the gap between complex
Al workflows and creative storytelling. It utilizes a multi-agent LLM architecture to co-author narratives while
leveraging IP-Adapter technology to ensure rigorous visual consistency of characters across all generated
illustrations.  It provides  a private, secure  environment for users to transform  ideas  into  structured,
illustrated digital books.
Features Include:
Dual-Interaction Modes: Offers a "Chatbot Mode" for collaborative world-building and a "Story
•
Generator" mode for streamlined, automated narrative creation.
•  Multi-Agent  Orchestration:  Employs  a  specialized  hierarchy  of LLMs-Director,  Writer,  and
Reviewer-to ensure narrative logic, stylistic depth, and editorial quality.
•  Visual Identity Locking: Integrates IP-Adapter technology to maintain character features across
different scenes, allowing users to upload a face reference that remains consistent throughout the
story.
•  Open-Book Interface: Features a side-by-side web UI that mimics a physical reading experience,
coupled with real-time JSON-based page structuring.
•  Multimodal Accessibility:  Includes integrated Whisper-based STT for hands-free narration and
Coqui TTS for high-quality audio playback of the story.
Keywords:
Generative Al, LLM Orchestration, Stable
Diffusion, IP-Adapter, Multi-Agent Systems
(MAS)
Current Al tools lack character consistency,
demand complex prompting, and fail to delNer
personaltzed content.
| e            |     | e             |     |
| ------------ | --- | ------------- | --- |
| METHODOLOGY  |     | KEY FEATURES  |     |
iii  ..  • Dual Modes: Chetbot  [in.. .c tMt) &  Technology Used:
StoryGenerato,l strNmlaiedL
| ® __  |     | • Open-Book Ut ~bV-sdt oaot layO.Jt  |     |
| ----- | --- | ------------------------------------ | --- |
rn,m<:k.11\gar-irNding~  Next.js 14, React 18, Tailwind CSS, Typescript,
.-l
|     | C(N(AUOI  | • Auto-Structuring: ~M )SON stoty  |     |
| --- | --------- | ---------------------------------- | --- |
or~aAi:attOn behind UM-~  FastAPI (Python), Node.js, SQLite, JSON,
| r;~  | j   |     |     |
| ---- | --- | --- | --- |
Ollama (Llama 3), Stable Diffusion 1.5, IP-
| ~-  | '4  | • Voice lntei,r•IJon: Spe«h-to-lcul ('Sri') •tld  Text-to-Spe«:h {ITSI access.  |     |
| --- | --- | ------------------------------------------------------------------------------- | --- |
Adapter, OpenAI Whisper (STT), Coqui TTS,
| MOCT..JS  |        | • Visu~ consistency. IP·Ad«>ter Jod<S UStf  |     |
| --------- | ------ | ------------------------------------------- | --- |
| -         | ~ 4•   | facesKrCSSaH tllu:strab<lm.                 |     |
•  LangChain
|      | i7           | MultJ-Apnt Al: Directer, Wntct, ;,nd  |                                                     |
| ---- | ------------ | ------------------------------------- | --------------------------------------------------- |
|      | ,____.  TTS  | ~'8tllMSCOlabOrltttOtlJ«tU.           |                                                     |
|      | au!IIC~      | narniu,.                              | Supervisor Name:                                    |
|      | ~~•          | C o n  t a x t u a l  C h ar          | x t. ,  C h a t:   C o n . .o t f M y . , th        |
| • ta |              | a n   -' I  p e r s o n a  bU         | d l l ro m   th e   s t o r f s  c o nt t. 1 1 t.   |
Mr. Muhammad Amir Guizar
| [A] [~ | ]   |     |     |
| ------ | --- | --- | --- |
erooLSuseo
Group Members:
M. Abdul Wahab (22i-1178)
| DELIVERABLES  |     | NEXT  |     |
| ------------- | --- | ----- | --- |
S. Ahmed Ali (22i-1237)
| tlnteractr.-eStof)'bookWebApp  | MultJ--Qngu.1190S1Jpport  |     |     |
| ------------------------------ | ------------------------- | --- | --- |
| t Al O\irKtiet ChlltOt         | • Mooet OOWM'.IUOfl       |     |     |
PCF Expo,t  • Stof)'-10--.Acleo c:otnefSl0ft  Mujahid Abbas (22i-1969)
| t Olfline I..CICal A.I Ba<:ktnd  | • Mobllt IC)I) dewk)c::rnent  |     |     |
| -------------------------------- | ----------------------------- | --- | --- |

FAST NUCES ISLAMABAD CAMPUS

VoxCommerce
VoxCommerce is an Al-powered ad campaign agent designed to democratize high-performance
digital marketing for Small and Medium Enterprises (SMEs) in Pakistan. The system features two
main perspectives: the SME User view and the System/Admin view. The former allows users to
initiate and manage ad campaigns conversationally using bilingual (English and Roman Urdu) voice
commands, automating the creation of culturally localized ad creatives and strategies. If a user
encounters API restrictions or account bans, the system seamlessly transitions to fallback
automation for internal store inventory.
The latter perspective involves a sophisticated Decision Layer that uses machine learning models
(LightGBM and T-Learner) to predict Click-Through Rates (CTR), Conversion Rates (CVR), and
campaign Uplift. This enables dynamic budget allocation and automated deployment to the Meta
Marketing API, which is strictly gated by local SECP and NTN compliance checks to ensure secure
and verified ad publishing.
Features include:
Automated end-to-end ad campaign generation via bilingual (English and Roman Urdu)
voice input.
Dynamic budget allocation strategy using predictive machine learning models (CTR, CVR,
and Uplift scores).
Store-specific fa II ba ck automation if marketplace APls are restricted or failing.
VOX COMMERCE
G eNesvs
Al-powered ad automanon platform for b1hngual voice-to-ad
campaigns and intelligent budget optlmizallon.
liCISION)
Technology Used:
React.js, Python, FastAPI, MongoDB, OpenAI
GPT-3.5, LightGBM, T-Learner, Facebook Graph
API, Meta Marketing API
Supervisor Name:
Mr. Muhammad Farrukh Bashir
r o oo
Group Members:
Reaa.Js Python FastAPI MongoOB OpenAI LlghtGaM ,.-Learner Facebook Meta
TEAM MEMBERS Muhammad Affan Ali Khan (22i-1215)
Muhammad Affan Ali Khan (221-1215)
Muhammad Abdul Majeed (22i-1216) Muhammad Abdul Majeed (22i-1216)
Abdul Wasay (22i-0947)
Supervisor: Mr. Muhammad Farrukh Bashir Abdul Wasay (22i-0947)
Co-Supervisor: Or. Hammad Majeed
FAST NUCES ISLAMABAD CAMPUS

CrimeVision
CrimeVision is an Al-powered crime investigation platform designed to assist law enforcement in
identifying suspects through automated facial attribute extraction and matching. The system
processes free-text victim statements using Natural Language Processing to extract 28 facial
attributes, which are then matched against a labeled suspect image database using Computer Vision
models to generate ranked suspect lineups.
he platform consists of three role-based portals - a Victim Portal for case tracking and lineup
review, an Investigator Portal for case management and statement entry, and an Ad min Dashboard
or system oversight and crime analytics.
Features include:
•  NLP pipeline extracting facial attributes from unstructured victim descriptions using
BART, BERT, RoBERTa, and spaCy
•  Computer Vision matching using CLIP, DeepFace, OpenCV, and lnceptionV3
•  Automated suspect lineup generation with confidence scoring
•  Victim case tracking portal with real-time status updates and notifications
•  Investigator portal for case and suspect management
•  Admin dashboard with crime analytics and heatmaps
•  Role-based secure authentication via JWT
Keywords: Natural Language Processing, Computer Vision, Suspect Identification, Facial Attribute
Extraction, Crime Investigation
t~
CRIME VISION
t'&Y~
Supervised by:
| CllfflE VISIDI  |     | Ms.MorlumHida  |     |     |     |     |
| --------------- | --- | -------------- | --- | --- | --- | --- |
Taha Mahmood I Hassan Naqvi I Hamza Sabir
|     | 221-0840  | I  221-0797  |     | I  221-1322  |     |     |
| --- | --------- | ------------ | --- | ------------ | --- | --- |
HOW CRIMEVISION WORKS?
| INPUT -VICTIM STATEMENT          |            |             |                 | OUlPUT • SUSPECT LINEUP  |               |     |
| -------------------------------- | ---------- | ----------- | --------------- | ------------------------ | ------------- | --- |
| .,She                            | was  tall  | with  dark  | _,.             |                          | (~ 92% match  |     |
| brown eyes, a scar on her left   |            |             | Crimevision Al  |                          | r, 85% match  |     |
| chook, and long black hair• ..-  |            |             |                 |                          | 78% match     |     |
Technology Used:
,_
| V ic t i   | m   N      | L . P .    Co m p u | t e r   Su s p .e. | .c  . t  A l  | L i n e u p   Inv·e s -t i g· a t or  |     |
| ---------- | ---------- | ------------------- | ------------------ | ------------- | ------------------------------------- | --- |
| St a t e m | e n t  E n | g i n e   V is io   | n   - D0 B         |   T o p       | s u a p e c t t  P o r t a l          |     |
r - te u  £ x1, - r~o c   1 , 2 8   ~ e c t s f o c lo l   r o n k e d b y   Python, Node.js, React, PostgreSQL, AWS S3,
| ""'"'"        |                   | leoturn rrom            |               | oon,octt,nce  | "'9up.    |     |
| ------------- | ----------------- | ----------------------- | ------------- | ------------- | --------- | --- |
| d o s c r i p | t i o n   O t l r | i b u t e t   ' " " " " | '  d o to b o | 1 e           | , _ I K   |     |
e n t e r e d   b y   i m o g K   q u ,e r l e d   t o r   CO N , n o tl f.  .s   O  in  Face Transformers
| l n vf l l> 9 0 | I O I'   c o- o l i | d " e n c  e   | m o < c     | " " '  " | " " '° "   " 1 c d m   |                   |
| --------------- | ------------------- | -------------- | ----------- | -------- | ---------------------- | ----------------- |
|                 |                     | c  . . .       |             | S        | <O < O d               |                   |
|                 |                     | "-'=           | Postgre$0l  |          | eo,e                   | Supervisor Name:  |
|                 | 8ARl 8ERT           | -"'v           | AW$$3       |          | Monogem«"              |                   |
ROBERTO
Ms. Marium Hida
TIMELINE
Group Members:
| 0   |     | e   |     |     | 0   |     |
| --- | --- | --- | --- | --- | --- | --- |
Taha Mahmood (i22-0840)
| S&pt-Oct  |     | Nov·O.C  | Feb-Mot  |     | Ap-• May  |     |
| --------- | --- | -------- | -------- | --- | --------- | --- |
Hassan Naqvi (i22-0797)
Dataset Collection
NLP Pipeline
Taxonomy Design
_..,
TECHNOLOGIES USED
n
aws
G,U
DponCV

FAST NUCES ISLAMABAD CAMPUS

EZ-Drive Night Vision System
EZ-Drive is a real-time night vision enhancement system built for drivers, addressing one of the
most critical yet overlooked road safety challenges: poor visibility during nighttime driving. The
system is developed with the perspective of everyday drivers, traffic safety researchers, and
automotive engineers in mind.
Drivers face two primary visibility hazards at night - blinding glare from oncoming headlights and
dangerously dark road regions with insufficient illumination. Existing solutions either apply
uniform brightness adjustments that worsen glare, or require expensive specialized hardware. EZ-
Drive solves this through intelligent, region-aware image processing that treats each part of the
frame differently based on its brightness characteristics.
The system divides every video frame into three brightness regions and processes each in parallel:
high-intensity glare zones are suppressed, mid-light areas are gamma-corrected using adaptive
lookup tables, and dark regions undergo atmospheric dehazing to recover hidden road detail. All
processing happens in real-time using parallelized CPU threads via OpenMP, with optional GPU
acceleration via CUDA.
Features include:
• Real-time adaptive frame segmentation into three brightness regions.
• Headlight glare detection and localized brightness suppression.
• Gamma correction and LUT-based intensity scaling for mid-light zones.
• Atmospheric light estimation and scene radiance recovery for dark regions.
• Parallelized image processing pipeline using OpenMP for multi-threaded CPU execution.
• CUDA-based GPU acceleration support for high-performance deployment.
• Frame reconstruction engine that seamlessly merges all enhanced regions.
• Real-time video output with measurably improved nighttime road visibility.
• Demo prototype with before/after comparison of enhancement results.
Key Words: C++, OpenCV, OpenMP, CUDA, Region-Based Enhancement, Night Vision, Real-Time
Image Processing, Driver Safety, Parallel Computing
Technology Used:
C++, OpenMP, OpenCV, Cuda
Supervisor Name:
Ms. Munazza Nida
Group Members:
Kaf Abbas (i22 -0763)
Abdul Momin (i22 - 1326)
FAST NUCES ISLAMABAD CAMPUS

Sentinel
A Flood Prediction and Risk Assessment application is being developed for both citizens and
travellers. Users are able to check real-time weather data, historical rainfall statistics, 7-day future
forecasts, specific local waterbody information, and precise Al-driven flood risk assessments. It
also provides critical emergency tools such as locating nearby hospitals.
Features include:
Comprehensive API Integrations: Location-based queries leveraging the NASA POWER API for
historical rainfall, OpenWeather API for future forecasts, and the DAHITI API for real-time surface
water level extraction.
Al-Driven Risk Assessments: Advanced machine learning models utilizing regularization for
accurate real-time flood predictions and water level estimations.
Emergency Assistance: Integrated mapping for locating emergency contacts and nearby hospitals
during crises.
Targeted Local Monitoring: Specialized tracking far critical local water channels (e.g., Lai Nallah).
Key Words: Flood Prediction, Risk Assessment, Machine Learning, DAHITI API, Emergency
Management System
Technology Used:
MERN, Python, OSM, DAHITI, Openweather,
NASA POWER
Supervisor Name:
Mrs. Nirmal Tariq
Group Members:
Aman Asif (221-0855)
Affan Amer (211-0611)
Mobeen Hasan {221-0795)
FAST NUCES ISLAMABAD CAMPUS

Precision Farming Robot
WeedX (PFR) is a modular robotics platform integrating Raspberry Pi-based ROS2 nodes, ESP32
microcontroller firmware, a Qt6 desktop client with a Digital Twin, and a mobile dashboard. The
system  follows  a  layered  architecture  with clear separation  between hardware control,  ROS2
communication, simulation, and user interface components. The Raspberry Pi hosts independent
ROS2 nodes for motor control, IMU sensing, encoder odometry, and high-level robot control and
ESP32  manages low-level actuation, sensor acquisition, and telemetry. The Qt6 Desktop Client
separates ROS2 communication, simulation logic, and UI modules, using a dedicated ROS2 thread
with queued signals/slots and centralized logging. Data flow is structured from ROS2 topics to UI
widgets and from UI commands back to ROS2 publishers.
•  Layered, modular architecture with defined hardware, ROS2, simulation, and UI layers
•  Independent ROS2 nodes for motor control, IMU, encoders, and robot controller
•  Qt6 Desktop Client with threaded ROS2 interface and Digital Twin visualization
•  ESP32 firmware for low-level control and telemetry, with planned navigation and GPIO
integration
Key Words: Agriculture, Robotics, YOLO, Weed Detection
r
| l~-A-u-to-no_m_o_u_s _A_gr_i'-u!l-t'~-ra-~-a~-d-~-~-~d--M-a-na-g-em- |     | en_t_~i  |     |     |
| -------------------------------------------------------------------- | --- | -------- | --- | --- |
Platform -System Architecture.
The On-Robot Unit (Raspberry Pl)
| • ,o.,.  Raspbearr y-P1_4-.....JJ..,:,i.s! .2. 2.._.(j~- _~~-:-~:~_;_.;.,.,, |     | -~  |     |     |
| ---------------------------------------------------------------------------- | --- | --- | --- | --- |
Dig ita l  T w in
| WeeclN~t:ctbn  | C3mtn Node  Video, Nav. Contro~  | N o d e                |     |     |
| -------------- | -------------------------------- | ---------------------- | --- | --- |
|                | Cmd Enc, Readinn                 | (Desktop Application)  |     |     |
| (2)~           | ~                                |                        |     |     |
N..11119.it,!_~_,control,
| Na\llgatl?  | Atuation         |             |     |     |
| ----------- | ---------------- | ----------- | --- | --- |
| Node        | Encoder reeding  |             |     |     |
| -~-         | ("A_t+-          | ROS2  ROS2  |     |     |
0  0  0
| fl"1omf"  m1taor  | MQTTNod•  |     |     |     |
| ----------------- | --------- | --- | --- | --- |
o -•<•o
'i"
| ot MotJO"  eR 14<1ur  | Sensor Node  |     |     |     |
| --------------------- | ------------ | --- | --- | --- |
Technology Used:
(l  Edge Computing &  ROS2, Qt6, Raspberry Pi, Katlin, Php, C++, YOLO
Monitoring (Digital Twin)
| ::.=================~==---~,,, - |     | --~,====:- |     |     |
| -------------------------------- | --- | ---------- | --- | --- |
Supervisor Name:
| Cloud Backend &  | f  __.-~ | -   |                    |     |
| ---------------- | -------- | --- | ------------------ | --- |
| Services         |          |     | Ms. Umarah Qaseem  |     |
(AWS loT & PHP)
"'IVS IOI Core
::-==================-'.'.:.=..·---~  Database  - - Group Members:
Umer Ghafoor (i22 -2328)
Mobile Access
| (User Interface)  | \                         |     | Taha Sajid (i22 - | 2302)  |
| ----------------- | ------------------------- | --- | ----------------- | ------ |
| L                 | ._.,. ROS2 Communication  |     |                   |        |
MQTT over Internet  .J
.... _______M_ o_bile_D_as_hb_o•~rd  Backend Communication  Muhammad Umer (i22 - 2365)

FAST NUCES ISLAMABAD CAMPUS

Sales Simplifier
Sales Simplifier is an Al-powered lead extraction platform designed to simplify and automate the
sales prospecting process. The system consists of two main components -a Chrome Extension and
a Web Dashboard with Admin Panel. The Chrome Extension allows users to extract contact
information and generate structured summaries directly from live webpages using Al models.
Extracted data can be securely saved to a centralized dashboard where users can manage, review,
and delete stored leads. The Admin Panel enables monitoring of registered users and system
activity. The platform integrates Al models for improved extraction accuracy, event-driven
workflows using lnngest, CRM integration, automated campaign support, and scalability testing
before deployment on Vercel.
Features include:
• Al-powered contact extraction and webpage summarization
• Secure authentication and personalized user dashboard
• Admin panel for user and system management
• Event-driven workflows and automated background processing
• CRM integration and deployment-ready scalable architecture
Key Words: Web Development, Chrome Extension, Al, Next.js, Full Stack
Supervisor
Mr.Almas Khan
Croup Members
Ali Asif 22i-1019
Muhammad Taha ui-0870
Mou Farooq 22i-1173
Sales S1mphfier streamlines lead generation by e11tract1ng contact information and
structured 1ns1ghtsd1rcctly from live webpages It empowers sales teamsw,th Al·
driven summaries, secure dashboards, and automated workf lows
Technology Used:
Next.js, Monge DB, Manifest V3, Visual Studio
Code
Su ervisor Name:
Mr. Almas Khan
Group Members:
Chrome E,ctension MVP Cemini Model CRM Integration lnngest lnterration Ali Asif (i22 - 1019)
Auth lnngestionAPI Al Model Accuracy Scalability Testing
Dashboard MVP UI/UX Automat~Campaigns Vercel Deplo)'ment
Admin Panel Automated Testing Muhammad Taha (i22 -0870)
Moaz Farooq (i22 - 1173)
FAST NUCES ISLAMABAD CAMPUS

CyberFence
CyberFence is a desktop-based cybersecurity system that performs real-time anomaly detection on network
traffic using XG-Boost(Multi Classifier). To ensure transparency and trust, all alerts are securely logged on
blockchain, making them tamper-proof and auditable. The system also incorporates a feedback loop, allowing
users to verify alerts and continuously improve the model's accuracy.
he system addresses critical gaps in existing cybersecurity solutions including lack of transparency,
adaptability, and tamper resistance. Traditional IDS and SIEM tools store logs in centralized databases that can
be altered by attackers, compromising forensic evidence. Al-based systems are susceptible to adversarial
evasion and false positives. CyberFence bridges Al-driven threat detection with blockchain-backed integrity,
ensuring transparency, adaptability, and traceability across the cybersecurity lifecycle.
Features include:
-Real-time network traffic monitoring and packet capture
-Al-powered anomaly detection using binary classifier
-Blockchain-based immutable logging of alerts and events
-User feedback mechanism for continuous model improvement
-Visualiz;:ition dashboard with real-time ;:ilerts ;:ind analytics
-Adm in panel for model lifecycle management and forensic investigation
-Support for model retraining using verified user feedback
Key Words: Al, XG-Boost, Blockchain, Cybersecurity, Anomaly Detection
e
CYBERFENCE
To provide a secure, intelligent, and auditable defense framework
using Al Model and blockchain
ARCHITECTURE
Technology Used:
Python, PyTorch, Tauri, FastAPI, Web3.py, Scapy,
TensorFlow, Ethereum Blockchain, React, Typescript
Supervisor Name:
BLOC KC HAIN
TIMELINE
Fahad Shafique
Co-Supervisor Name:
PHASE 2:
DATA P C H O A U S E E C 1 T : ION & OE A \I J E 1 L ,4 O 0 P 0 M a EH T BlO PH C A KC SE HA S: J N SYST P E H M A T S E E S • T : ING Nill
PAEPROCfSSING (CNN) INTEGRATION & OEPLOYMElfT
SEPl·OCT ltO'l·DEC JAH·FEB MAR•APR
TrainCN"'-nodel, °"""'"""' rinalaudit,depb)
CIP{ffll&eacewac, cooracu, $t!CU'eledge," 1)1vt8l'll'Onmei'll Group Members:
TOOLS
HAM MEMBERS
Salman Ahmed (221-0743)
stripe O oP yTorch • i22098(1 Muhammad Haider Bukha i
i2211'-6 Hamra:z. Ahmed M. Haider Bukhari (221-0980)
1220743 Salman Ahmed
supmisor,
Hamraz Ahmed (221-1146)
Mr Fahad Shaflque
FAST NUCES ISLAMABAD CAMPUS

Truth Shield Al
Truth Shield Al is an intelligent, multimodal misinformation detection platform designed to combat
the growing epidemic of fake news and Al-generated disinformation. In today's digital landscape,
fabricated articles, deepfake images, and Al-generated content spread faster than verified truth,
eroding public trust and distorting reality. The system performs credibility analysis on text and
images through an agentic Al pipeline built with LangChain, powered by Transformer-based NLP
models (via HuggingFace transformers) and a Vision Transformer (ViT) classifier for Al-generated
image detection. A FAISS vector store with Sentence Transformers enables semantic similarity
search (RAG), allowing the system to cross-reference claims against a persistent knowledge base.
The backend is served via a high-performance FastAPI REST API, with spaCy, BERTopic, and
scikit-learn providing topic modeling and explainability layers.
Features include: Real-time fake news & bias detection from article text, Al-generated image
detection (deepfake scoring), Semantic RAG-based fact cross-referencing, Explainable credibility
verdicts with confidence scores, Author & source credibility profiling
Key Words: Misinformation Detection · Agentic Al · Retrieval-Augmented Generation (RAG) · Multimodal
Analysis · Transformer Models
mrm
OR. ASIF MUHAMMAD MALIK
TRUTH SHIELD Al
A COMPREHENSIVE Al POWERED INFORMATION CREDIBILITY ASSESSMENT
PLATFORMT HAT EVALUATES THEA UTHENTICITYO F DIGITAL CONTENT
ACROSS MULTIPLE MODALITIES
ARCHITECTURE
Technology Used:
Python, JavaScript, FastAPI, React 18, Vite,
PyTorch, Hugging Face Transformers,
MARCH
S(lllWAR(TE$TIMO
O[M;lHJf'TIJION DeBERTa-v3, Sentence-BERT, FAISS, spaCy,
ElALIMTION
OpenCV, Pillow, ONNX Runtime, BERTopic,
scikit-learn, LangChain, Integrated Gradients
XAI Uvicorn ASGI HTML CSS
0 FastAPI r' kaggle 6'5 @ 0
Dr. Asif Muhammad Malik
mnrrnrn;-rnn
120948 MUHAMMAD RAFAY 221156 ARHAM KHALID Grou Members:
l2822Z AMMAR HUSSAIN
Muhammad Rafay(22i -0948)
Arham Khalid (22i - 1156)
Ammar Hussain (22i -8222)
FAST NUCES ISLAMABAD CAMPUS

NEURA
NEU RA is an Al-powered mental health companion designed to provide accessible, empathetic, and
clinically informed support for individuals experiencing psychological distress. It functions as a dual-
facing digital platform that offers patients a safe space for emotional expression through
empathetic conversational support, while simultaneously generating structured insights and risk
assessments for psychiatrists.
The system bridges the gap between purely conversational Al tools and traditional telehealth
platforms by integrating real-time symptom detection, therapeutic activities, and clinically
validated assessment tools. NEURA enables continuous patient engagement and early risk
detection while producing structured outputs that support clinical decision-making.
Rather than replacing human clinicians, NEU RA is designed to assist therapy and improve access to
mental health support, providing ongoing support between sessions and helping mental health
professionals monitor patient wellbeing through actionable clinical insights.
Key Features:
• Empathetic Al chat bot using fine-tuned Llama 3.2 (3B) model for therapeutic conversations
• Automated clinical assessment using validated scales (PHQ-9, GAD-7, PSS-10, PCL-C)
• Real-time symptom extraction and severity analysis from natural conversations
• Crisis detection with escalation protocols for high risk situations
• Dual-facing interfaces: Patient dashboard and Psychiatrist clinical dashboard
• Progress tracking with visualizations and therapeutic activity gamification
• Appointment booking and secure video/audio therapy consultations
• Structured patient summaries and dual-format session notes for clinicians
Key Words:
Al Mental Health, Conversational Therapy, Clinical Assessment, Natural Language Processing,
Telehealth Platform
Technology Used:
Backend: Node.js, Express.js, Ollama API,
Llama 3.2 (3B), Firebase
Frontend: React (v18.3.1), Typescript, Vite,
Framer Motion, Tailwind CSS
Security: AES-256, TLS 1.3, JWT Authentication
Supervisor Name:
Ms. Ra bail Zahid
Group Members:
Ali Hassan (221-1545)
Mir Hussain (221-2588)
Abdul Hadi Saqib (221-1333)
FAST NUCES ISLAMABAD CAMPUS

BlockEscrow
A blockchain-based decentralized escrow system designed to enhance transparency,
security, and trust in supply chain transactions. The system facilitates secure interactions
between buyers, suppliers, delivery agents, and end users by automating payment handling
through smart contracts. In traditional supply chains, transactions depend heavily on
centralized intermediaries for payment processing and document verification, which often
leads to payment delays, fraud risks, and lack of transparency. BlockEscrow addresses these
challenges by implementing escrow smart contracts that lock funds until delivery conditions
are fulfilled. Supply chain events such as product handovers and delivery checkpoints are
recorded on the blockchain to ensure immutable and verifiable transaction history.
Important documents including invoices, certificates, and delivery proofs are stored using
decentralized storage to prevent tampering. The system also provides a web-based
dashboard that allows stakeholders to monitor transaction status, track deliveries across
checkpoints, and access relevant documentation. In case of disputes, the platform allows
submission of evidence such as videos or documents, enabling a transparent dispute
resolution process.
Features:
• Creation and management of escrow smart contracts for secure fund locking and
automated payment release
• Blockchain-based recording of supply chain checkpoints and transaction events
• Decentralized storage of invoices, certificates, and delivery proofs using IPFS
• Real-time monitoring of transaction progress through a web-based dashboard
• Role-based access for buyers, suppliers, delivery agents, and administrators
• Dispute resolution system with evidence submission and verification
• Multi-chain compatibility for improved scalability and reduced transaction costs
Keywords: Blockchain, Smart Contracts, IPFS, Supply Chain Management, Decentralized
Applications
........ .,.,.~ .....
"..-...- ,-..-,.·_•, ...... .,.,.1 -,
~--•n•li•N
=~----~--- -· ...
-·--~
Technology Used:
Tlmcllnc= Node JS, Solidity, IPFS, Hardhat, Polygon,
Wormhole
""P.-•-~
-~-===-
Supervisor Name:
••••
Future
Er,h~nc-@nt
___ Mr. Majid Hussain
- r: _ _ - - 0 ,- _ - - . _ -, - -, .. _- _ - _ . .. . . ,, ": . - :" _ · " · . · 0 . ~_ . ,, : . . .;. .. .- _:'.t - .,;_:,.- :· ,_ __, • , 0 _ - . ., • ., r . _ < _ .r ,., __, Group Members:
... Maaz Masood 211-2551
Tools &
Technologlc:c Haris Sultan 211-0461
Muhammad Salman Javed 221-1298
FAST NUCES ISLAMABAD CAMPUS

EcoMap: Multimodal PDAC Ecotype Modeling Using Spatial
Transcriptomics and Histopathology
EcoMap is a multimodal deep learning framework designed to predict spatial tumour ecotypes in
pancreatic Ductal Adenocarcinoma (PDAC) by integrating Spatial Transcriptomics (ST) data with
Hematoxylin and Eosin (H&E) whole slide images (WSls).
Recent spatial-omics studies have revealed that PDAC tumors are organized into biologically
meaningful ecotypes such as fibrotic, metabolic, immunosuppressive, and invasive-border regions.
These ecotypes are strongly associated with tumour progression, immune response, and the
therapeutic outcomes. However, spatial transcriptomics is costly, technically demanding, and rarely
available in routine clinical settings.
In contrast, H&E slides are generated for almost every patient and are widely accessible. EcoMap
addresses this gap by first training a multimodal teacher model that learns correspondences
between gene-expression patterns and histological morphology using ST and H&E data. This
knowledge is then distilled into an H&E only student model, enabling molecular-level ecotype
prediction directly from routine histopathology images.
The system generates spatial ecotype heatmaps, integrates cell-type composition information
through deconvolution , and incorporates uncertainty estimation to highlight low-confidence
regions. By making molecular tumour characterization accessible from standard slides, EcoMap
aims to bridge the gap between research-grade spatial omics and real-world pathology practice.
Features include:
• Teacher-Stdent knowledge distillation framework
• Spatial ecotype classification at spot level
• Generation of ecotype heatmaps over whole-slide images
• Cross-validation and patient-wise performance evaluation
• Biological interpretability throught pathway and cell-type analysis
Key Words: Multimodal Learning, Spatial Transcriptomics, Computational Pathology, PDAC
Ecotypes, Knowledge Distillation
SUPERVISOR
ECDMAP Mr. Muhammad Aamfr Gui.tut
T~EA=M M~EM=BE•R"S ""•
Multimodal PDAC Ecotype
DATA INSIGHT Modeling
'-""•---'~
Multi modal POAC f-ramewor1c: for pred1ctln& tumour ecocypes by inte2rat1ne
H&E histology and spatial transcriptom1cs
ARCHITECHTURE
Technology Used:
Python, ML pipeline, Kaggle, Visual Studio,
PyTorch, Scanpy, Seurat, NumPy, Pandas,
Matplotlib, UNI, Cell21ocation RCTD
Supervisor Name:
Muhammad Aamir Guizar
TIMELINE Group Members:
Wania Naeem (i22 -2369)
Emaan Ali (i22 -2325)
TOOLS & TECHNOLOGIES
Nabeeha Shafiq (i22 -2336)
P " 0 tt::: 0 k
FAST NUCES ISLAMABAD CAMPUS

Poselift- 2D to 3D Human Pose Estimation using Deep Learning
A deep learning-based human pose estimation system is being developed to reconstruct accurate
3D human skeletal structures from 2D images and videos. The project focuses on building a
complete pipeline that performs 2D keypoint detection followed by 3D pose lifting using
benchmark datasets. The system is designed from a research perspective, aiming to evaluate
geometric consistency and performance using standard evaluation metrics.
Features include: 2D human keypoint detection from images and videos using deep neural
networks, Joint localization trained on the COCO dataset, 2D-to-3D pose lifting using the
Human3.6M dataset ,Root-relative 3D joint coordinate reconstruction ,Geometric reprojection for
validation and consistency, Performance evaluation using standard metrics such as Average
Precision (AP) and Mean Per Joint Position Error (MPJPE), Structured storage and visualization of
2D and 3D skeletal outputs.
Key Words:
Deep Learning, Human Pose Estimation, 2D-to-3D Lifting, Computer Vision, Geometric
Re projection
| Toan, M•onbo,s                     |                        | •   | sup ...u o,                                  |     |
| ---------------------------------- | ---------------------- | --- | -------------------------------------------- | --- |
| "'"' K,.,,ci _.._,.._~,_,          |                        |     | '  ,  ''  ••~                                |     |
| ,.,,, , ,._ ,\ ,-,1  f ti -h ii l  | ,~  •  1>'' -,)  "l )  |     | '"  Lo•!>upcr¥!.,c,r  "-• ,_,. >, <1<>•\ rr  |     |
A Rese;;,rcfl~O,,entec:I Fr<:1trie1Nor~ tor 30 Sl<eleton Reconstn..·ct,on
| --------           | OBJECTIVE--------- |                                      |                |     |
| ------------------ | ------------------ | ------------------------------------ | -------------- | --- |
| Tu  de.sign Ctrld  | lrnplenH.:Hll a    | <Jet:!r.>  ltH;.U'fllrlg-l.>al:>ecJ  | µipelilH::::!  |     |
thot occurotely rceon:struet~ 3D humon :.kcletol po:ses tr-om
20  using geometr-ic r-epr-ojection consistency and benchmar-k
•
| ---- | - CORE ARCHITECTURE ---- |     |     |     |
| ---- | ------------------------ | --- | --- | --- |
1t'
*
|                  | P o s             | e   Naur.al                        | Cycl•-                          |     |
| ---------------- | ----------------- | ---------------------------------- | ------------------------------- | --- |
| 2 0  P o f . 4   | Nor... ,.: i,, li | .., ,.,1.,.. .  P o • •  L l ft ln | v   < .o n • I  s t • n '- l f  |     |
E st im a t i o n   F, - ., m • w o r k   v a l i d a t i o n   Technolo  Used:
| ------- | WORKmFLO..-W ------- |     |      |     |
| ------- | -------------------- | --- | ---- | --- |
|         |                      | fN' | i -- |     |
Python, PyTorch, OpenCV, NumPy & Pandas,
"•P"Ole<'.OIO-. ..a y. .,
Matplotlib / Plotly ,COCO Dataset, Human3.6M
|          |     | .;.t       | ,,-h     |     |
| -------- | --- | ---------- | -------- | --- |
| r;::  7  |     | , r , c ,  | ,  _ .,  |     |
····>  Dataset
|          |     | 1 1 - -- ~                                                                     | :   ,,                                           |     |
| -------- | --- | ------------------------------------------------------------------------------ | ------------------------------------------------ | --- |
| L  .::J  |     |                                                                                | ct.-                                             |     |
|          |     | ,,,....,,"-"',._... .... .,. , P,-'o•-. . . U . I ;  I ; I . IK - I  - " • ' Y | '"IH  _ I _ •  _,., .);l   ~P0r5•. h.• '•1C•r,,  |     |
Su  ervisor Name:
--•~C:o~,_,.}
Mr. Shoaib Saleem Khattak
-----
| ------ | PROJECT PHASES ----- |     |     | Grou  Members:  |
| ------ | -------------------- | --- | --- | --------------- |
Ahmed Mustafa (i22 - 2301)
O e W s • t
| Pr o p . - r o n l o n | ,   l r n p l o r n o | ~ t - > tlon  T t a in l n g   c u | s t o m  l !v a l u a t f o n   &   |     |
| ---------------------- | --------------------- | ---------------------------------- | ----------------------------------- | --- |
P r o o r o c o s s l n g   E1 1 C p l O r o 1 'l O r y   ~ O   d " ' l ~ C t 4 ".'l r  I t  D e p l o y .. . , . n t : ,   Hashir Ahmed (i22-1988)
| N o • m n l i: ic : ot i | c n   2 0 / 3 0    | : s o   1 1 n : 1 n 9   | P e r r o r m e n c e        |     |
| ------------------------ | ------------------ | ----------------------- | ---------------------------- | --- |
|                          | • • t lm f l r i o | o ,   n • t w - o r k   | b • n c h m a r l c . i n g  |     |
Azhaff Khalid (i22-1895)
.T..o. ols & Technologies
(-
| =   |       | c"  | C.  |     |
| --- | ----- | --- | --- | --- |
| r'  | ilil  |     |     |     |

FAST NUCES ISLAMABAD CAMPUS

Healthlink Al
Healthlink Al  is an Al-powered  healthcare platform designed to improve patient care through
intelligent diagnosis  assistance,  smart  triage,  and  integrated  healthcare  services.  It connects
patients, doctors,  pharmacies,  laboratories, and administrators through  a unified  multi-portal
system. The platform includes five portals: Patient, Doctor, Pharmacy, Laboratory, and Admin. The
Patient Portal allows users to interact with an Al  virtual doctor in English  or Urdu to analyze
symptoms,  ask  follow-up  questions,  predict  possible  conditions,  and  recommend  specialists.
Patients can book appointments, view prescriptions, access medical history, order medicines, and
request lab tests.  The Doctor Portal  enables doctors to manage consultations,  review patient
records,  write  digital  prescriptions,  and  manage  appointments.  An  XGBoost-based  disease
prediction  module analyzes symptoms and voice variations after consultations,  visible only to
doctors unless shared with patients. Doctors can also manage availability through Google Calendar
integration. The Pharmacy Portal handles prescription verification and medicine orders, while the
Laboratory Portal manages test requests, sample tracking, and digital reports. The Admin Portal
controls user management, doctor verification, database operations, and system monitoring.
Features include:
Al-based symptom analysis and triage
Multi-portal healthcare platform
Appointment booking and digital prescriptions
Pharmacy and laboratory integration
Voice interaction using speech recognition and text-to-speech
Key Words: Artificial Intelligence, Healthcare Management, Telemedicine, Al Diagnosis, Multi-
Portal System
| /'";'ft\ Health link Al |     |     | ~ @  |     |     |
| ----------------------- | --- | --- | ---- | --- | --- |
\ <il.J
i
Al-Powered l·lealthca.-. Platform for Intelligent Olagnosl,
,.,. .....  Assistance, Smart Triage, and Integrated Healthcare Services
HNlt.llt.W Al conne:h p1.kflLI, lactors. pt-..am..:..-S.11:xn~in,..:f
~llllffl.uic.sl~~all'~~mlll:Jpoolft\t'cllUIC.aft~,sxn k)'lffl'11)7
ar.i,.IDMlhl~HlldruclJMIP:Uin:1.
| System        |     |     | Key       |     |     |
| ------------- | --- | --- | --------- | --- | --- |
| Architecture  |     |     | Features  |     |     |
PllltfltOortlf
•.U'f111U!thn•
| f:iQlllltnl ll~J  |     |     | mD 11!M1tlttN .:.lllc.ll   |     |     |
| ----------------- | --- | --- | -------------------------- | --- | --- |
4l=-..,4i=
1 r:=ct=:-
•i=ldl·lt-t-PttCI}
| L 1 b o n l D fJ P G | « al  |     | =r=''"·  |     |     |
| -------------------- | ----- | --- | -------- | --- | --- |
Technology Used:
| :•  ltZ= l ll l'° .( t:lC~ J l'I |   y   |     | I   |     |     |
| -------------------------------- | ----- | --- | --- | --- | --- |
A d l n i •.  Pnor~tal -..  44::.:~~~  React.js, Typescript, FastAPI (Python),
| ,1 ..   . .   |     |     | =:.i::::~  |     |     |
| ------------- | --- | --- | ---------- | --- | --- |
| •l)'ckf•~O••  |     |     | &          |     |     |
·l\'tlca~'tif111Q
PostgreSQL, LangChain, FAISS, Groq API,
TailwindCSS, JWT Authentication
J,.
Supervisor Name:
| Tecmologies         |            |                                |                                | Mr. Mohsin Khan       |        |
| ------------------- | ---------- | ------------------------------ | ------------------------------ | --------------------- | ------ |
|                     | m          | 4                              | Ii  •                          |                       |        |
| ,,,  XJ;Boort       | 0. ... ..  | 11•1  1                        | 1>                             |                       |        |
|                     | ,          |                                | , .l. a, d ,, M ,              |                       |        |
|                     |            | R,~.:011  l;e,,i,:,.«t-l:••·   | S O I.                         | Group Members:        |        |
|                     | c.h~»t     |                                | Di ta " ' -"  L 4 f f l it o   |                       |        |
| Timclirn:, Section  |            |                                | Project Team                   |                       |        |
| i\                  | ,          |                                |                                | Bila I Rasheed (i22 - | 1337)  |
SupertiMr
| wtll•1MMiM | bMMNtiMM\SW·t- |     | M•  t.tohdn tll..i  |     |     |
| ---------- | -------------- | --- | ------------------- | --- | --- |
T~ear-•nM~e mM,.
|     |     |     | •m1nt  | Saif ul Haq (i22 - | 1306)  |
| --- | --- | --- | ------ | ------------------ | ------ |
e ~i.i nasMl!d -12i-1l 37

FAST NUCES ISLAMABAD CAMPUS

Mira -Al Therapy Assistant
Mira is a real-time, voice-first Al therapy assistant designed to provide accessible mental health
support through natural conversation. Users interact via voice or text with audio being transcribed
using OpenAI Whisper, analyzed for emotional state through VADER, checked against a crisis
detection system, and then processed by a Large Language Model enriched with therapy-specific
knowledge via Retrieval-Augmented Generation (RAG). The LLM generates empathetic responses
grounded in established therapeutic frameworks including CBT, DBT, and ACT techniques.
Responses are converted back to speech and streamed to the user in real time. If a crisis situation
is detected, the system automatically intervenes with emergency resources.
Features include:
Real-time voice interaction with bidirectional audio streaming, speech-to-text and
text-to-speech with emotion detection and adaptive response tone
Al safety layer with 72-keyword crisis detection across 3 severity levels and automatic
emergency resources
RAG-powered therapy knowledge retrieval using pgvector semantic search across curated
CBT, DBT, and ACT techniques
Multi-platform access via React web app and iOS mobile app with conversation history and
session persistence
Key Words: Real-Time Voice Al, Therapy Chatbot, Crisis Detection, Retrieval-Augmented Generation
(RAG), Emotion Detection
Mira Te!lm Members
Ali Hamz.a Azom 22~2126
7-o" Bin And ?'nl UCl
Supervisor
Al Therapy Assistant Dr Ahmad Rozo Shahid
Real-rime, voice-first menral hea/ch support chrough natural conversacion
Speech-to-Text
0s. .., ...1 v..i.,. .. - ..... _,,1. ... ,
Technolo Used:
Python, FastAPI, React, Typescript, PostgreSQL,
Redis, pgvector, Docker, OpenAI Whisper, Edge
Ttmaltna • Iterations TTS, VADER Sentiment Analysis, SQLAlchemy,
Foundation Core Voice Enhanced Optimization a
System lntelHgence Deployment Vite, Tailwind CSS, Capacitor, AWS S3
D•lud #I.Id), _.,., ~~••/ f ,d-1010~d b,;,t .,., h MJll-awdo •-9n
. c lu k : , r : .. t o i " ; b . ' , o : , ! , . ; . . 7 ,~ : M 1 . ,, : t . : o _ H p ., . " , J "" _ "" u ' · • f ~b e a r ~ 1 ,-i e -cj n ,· b h: r t• , ; , " . _ 0 'P 1 ~' u I'~ i c ,9 o~ e c f ,=1 f\ • e ~· 1 ~'· ' W :. . . f o •, l 1f , O , •, h •.,• o l ..• _ d ,•, i . l ". a , " e , 1 v o , 1 l , c , , oJ o d tr J u f d b • n o • . e . . : r ~ o ., p , o i~ n g y . Su ervisor Name:
Dr. Ahmed Raza Shahid
01 02 03 04
Tools Grou Members:
Ali Hamza Azam (i22 -2126)
Zain Bin Asad (i22 -1240)
FAST NUCES ISLAMABAD CAMPUS

AgenticN DR: Al-Powered Cyber Defense Agents
AgenticNDR is an Al-driven Network Detection and Response (NDR) system that enhances cybersecurity
through real-time monitoring, anomaly detection, and automated threat mitigation. It integrates tools such
as Zeek, Suricata, Graylog, and the Elastic Stack to centralize log analysis and detect advanced attacks.
The core innovation of the system lies in its modular Al-driven agent architecture, consisting of:
•  Preprocessor Agent- Performs dynamic log parsing, normalization, and feature extraction.
•  Detection Agent -Applies continual-learning anomaly detection models trained on datasets such a
CICIDS2017 and UNSW-NBlS.
•  Planner Agent - Correlates multi-source events using rule-based and ML-driven prioritization t
determine appropriate mitigation strategies.
•  Response Agent - Generates explainable mitigation scripts and  executes automated defensiv
actions (e.g., IP blocking, host isolation).
The system provides real-time packet monitoring and centralized log aggregation, combined with Al-based
anomaly detection supported by continual learning mechanisms. It utilizes a multi-agent decision-making
architecture to intelligently correlate events and prioritize threats using a hybrid rule-based and machine
learning approach. Additionally, it supports automated mitigation and response execution while maintaining
centralized dashboards and audit logging for monitoring, transparency, and traceability.
Keywords: Network Detection and Response (NDR), Autonomous Cybersecurity Agents, Anomaly Detection,
Intrusion Detection Systems (IDS), Al-Driven Threat Mitigation.
Multi-Agent
Network Detection
& Response system
AgP.nt1cNDR 1s a multi-agent engine that monitors nenvorles, detects
anomalies, and automatically ctopc threats in rea! time Its an Al-
Pow.ered s y-ste-m -that. pnor1t1-zes- risk-s an.d take s explainable a.ctions
delivering fast,auditable security 11\lth minimal manual effort .
---
|     | NETWORK TRAFFIC  | SENSORS  | LOG AGGREGATION  |     | PREPROCESSING  |     |     |     |
| --- | ---------------- | -------- | ---------------- | --- | -------------- | --- | --- | --- |
Technology Used:
|     | AUDIT    | AUTOMATED  |     | CORRELATION  | ANOMALY    |     |     |     |
| --- | -------- | ---------- | --- | ------------ | ---------- | --- | --- | --- |
|     | LOGGING  | RESPONSE   |     | & PLANNING   | DETECTION  |     |     |     |
LangGraph, LangChain, Python, Graylog,
|     | •   | •   |     | •   | •   |     | Suricata, React, Node, Express  |     |
| --- | --- | --- | --- | --- | --- | --- | ------------------------------- | --- |
Supervisor Name:
|     | SE O P C T T E O M O B .  ER .  | •  -N C O l:C    | V E I M U a I l U R  •  | -JAN-UAA'f•                     | M1 0n :11 R t. 1A A Y                        |     |     |     |
| --- | ------------------------------- | ---------------- | ----------------------- | ------------------------------- | -------------------------------------------- | --- | --- | --- |
|     |                                 | .•  ,11_.MS,o,ll | l.l                     |                                 | , 1 o 1 o • t1 ,., M om A R C g H   , . .,   |     |     |     |
|     | •  .P .e. c.h. .M   C n p l u   | r•               |                         | , fr, , : t. - t. ,. .~ TM"""1  | · - tg- '.6.                                 |     |     |     |
•  $ w l e o l c , 1 , ~  · =   •M t 1 $ « 1 a n   .. ~.. .. . .,.  - N Y \   Pir Sarni Ullah Shah
|     | -~".::c«yP9  | . ...,.......,.  |     |     | r111,n-"IOndlling  |     |     |     |
| --- | ------------ | ---------------- | --- | --- | ------------------ | --- | --- | --- |
Group Members:
Supervisor  Oroup Members  Syed Tashfeen Hassan (i22 - 0860)
|     | Pir sani UUoh Shah  | Arshoq Kirmoni  |     | Mesom E Tamaar  | Tashfeen Hassan  |                      |        |        |
| --- | ------------------- | --------------- | --- | --------------- | ---------------- | -------------------- | ------ | ------ |
|     |                     | 22i•083'1       |     | 22H30'1         | 22i-0860         |                      |        |        |
|     |                     |                 |     |                 |                  | Mesam-e-Tamaar Khan  | (i22 - | 1304)  |
m
@
| graylog  |          |     | (D  |     | JS  ,.  |                                    |     |        |
| -------- | -------- | --- | --- | --- | ------- | ---------------------------------- | --- | ------ |
|          | surATA"  |     |     |     |         | Syed Arshaq Hussain Kirmani (i22 - |     | 0834)  |

FAST NUCES ISLAMABAD CAMPUS

CoWritelA
CoWritelA is an intelligent, multi-agent writing environment designed for novelists. It provides an
intuitive workspace that understands story elements, enabling effortless retrieval through
semantic understanding. The platform uses agents to index projects, extract entities, and detect
narrative structures. Featuring an embedded assistant, it offers context-aware RAG, in line
"Copilot" suggestions, and real-time research integration to help writers maintain narrative
consistency.
Features:
Automated Project Indexing: Async processing via Celery for documents
Intelligent Entity & Relationship Extraction: Identifies characters and locations using spa Cy N LP
Genre-Specific Al Writing Assistant: Story-aware responses
lnline Al Copilot: Real-time writing suggestions provided directly at the cursor position.
Real-Time Research Integration: Injects external knowledge into the chat context
Multi-Agent Architecture: CoWritelA operates as a system of specialized agents that collaborate to
build a rich knowledge graph of the writer's work.
Extraction Agents, Entity & Verification Agents, Relationship Discovery Agent, Structural Analysis
Agents, Embedding & RAG Agents, Interaction Agents
Key Words: Natural Language Processing, Semantic Retrieval, Retrieval-Augmented Generation, Creative Writing
Assistant Multi-A ent s stem
Technology Used:
SUPl:RVISliD aY Oil. ALI :Z:lili~
T£AM MEMBERS JUNAID ASA AR 221-0770, AISHA
SIDDIQ.A 221-1281, AYl:$HA lJAZ 221-08ff • Next.js 15, React, Typescript, Tailwind
CSS, Zustand, GSAP
CoWritelA
• Python, FastAPI, AsynclO, Celery,
A MULTI-AGENT SYSTEM Flower
• MongoDB (Motor), ChromaDB, Redis
Objective & Motivation
• spaCy, Sentence-Transformers,
Wrot. .. rc,. oftAn c,.truool"" h"l t,nr.k r.omr,IA• c,tc.ry AIArnAnl«, ..,,t<:h ,...,. r.hnrnr.tArr"'-,
t1mel1nes, and relot,onsh1p3 aero= long monuscr1pts. CoWri'telA wos HuggingFace Inference APls, Groq,
cr90t,e,d 10 simplify story monogement using Cl cognitive writing
,..,wirc,nm<ionl 11"\Qt h9lp, wnt,..,·5 or90ni~. 1..orch, cand d1J>v<i0lop long-for.,.,
stories more efflclen'tly. Tavily Search API
• JWT (python-jose), passlib/bcrypt, Rate
Limiting
Architecture & Overview
• thon-docx,
Intelligent Content Cree,tion System Architee-ture
Supervisor Name:
Dr. Ali Zeeshan
Group Members:
Junaid Asrar (i22 -0770)
Ayesha Ejaz (i22 -0899)
Deliverables
Aisha Siddiqa (i22 - 1281)
Tools & Technologies
(X)
FAST NUCES ISLAMABAD CAMPUS

Vital Guardian
Vital Guardian is a continuous, non-invasive ICU patient monitoring system designed to mitigate
nursing shortages and clinical alarm fatigue. Acting as a digital co-attendant, it replaces
uncomfortable physical wearables with a privacy-first Al sensor-fusion architecture. A "Visual
Guardian" leverages YOLOv8, MediaPipe, and EfficientNet for real-time patient tracking, fall
classification, and seizure verification. Alongside it, an edge-deployed "Auditory Watchdog" utilizes
Silero-VAD, Faster-Whisper, and YAMNet for bilingual (English/Urdu) keyword spotting and distress
detection. These parallel streams fuse into a "Cognitive Core," where a deterministic Reflex layer
triggers near-instant (<S0ms) critical alerts. Concurrently, a Multimodal LLM (Gemini 3 Flash)
synthesizes clinical context to dynamically suppress false positives, ensuring rapid, highly accurate
bedside responses while reducing healthcare cognitive load.
Features include:
• Real-time video analysis for patient state tracking, falls, and seizure verification.
• Edge-deployed, privacy-first auditory processing for bilingual keyword and distress
detection.
• Multi-modal sensor fusion using an LLM and deterministic logic to suppress false alarms.
• Near-instant (<50ms) critical event detection with automated clinical incident reporting.
Key Words: Al Healthcare, Audio-Visual Fusion, Multimodal LLM, Computer Vision, Edge Al
__ _
.,..-. ........ _.- ...,......_._ , _ ~,..,.. ,,".,-..~ .J
VITAL GUARDIAN
,~c--n -
I . C _..,... - ,., • . .... • , = , - - w •n .. , -. g .-. < -.. t .· a . , •. _ .. . . . ., , ., . .. . . - _ . _ ... . . ... . .. ., . .,., , ., _ _ I - . o " _, " , " . - . - ._ , ~ , o ,. . . _ ,_ • _ .. - . . ~. . ,. , .a. , .., - . . , , , . , . . . . . , .. , . - . _ . . . . , , . ., . , _. . , _ . ., _ . , . _ ~. . , . . . ",, . , _" . _ . ,' .. ~. . ~ _ - - . . " .
I avaTliM ARCIIITliCrURli
Technolo Used:
Python, PyAudio, PyTorch, YOLOv8, MediaPipe,
Silero-VAD, Faster-Whisper, YAMNet, Gemini 3
Flash LLM, Flask
Supervisor Name:
Dr. Basharat Hussain
Group Members:
Eman Hassan (i22 -0745)
- -.- ...... ·-·---•·--•-·
... .. " ... . ... " .. ' ,. _ , ._ .. ,. __ ,.. _ _ _._.._. __,_ ___ _~ ..,.- _-_,~. ...,.-.~- -..- -· ·- ·~ - - -- .'L Muhammad Mahad Khan (i22 -1028)
--·----
...
.. _ ·--····•-·-"••··~-- Muhammad Hasan Waqar (i22 -1192)
FAST NUCES ISLAMABAD CAMPUS

lntellico
lntellico is an Al-based research assistant developed to support students, researchers, and
professionals in understanding academic literature more efficiently. The platform provides a simple
and interactive way to explore research papers by converting complex content into clear
summaries, extracted keywords, visual workflow representations, and concept maps.
Users can upload research documents and ask questions in natural language. The system responds
with context-aware answers directly from the uploaded material through an intelligent query
feature. In addition, lntellico includes a smart search and recommendation system that suggests
relevant research papers based on content similarity.
For this FYP, the scope of I ntellico is limited to dental research papers only. The system is specifically
designed and optimized to process and analyze academic literature within the field of dentistry.
The application is built using React for the frontend interface, Flask for backend development,
MongoDB for data management, and Docker for deployment. Its intelligent capabilities are
powered by a fine-tuned language model integrated with semantic search techniques.
By simplifying literature review and reducing the time required to analyze research papers, lntellico
enhances academic productivity and promotes evidence-based learning in dentistry.
Key Words: Large Language Models (LLMs), Retrieval-Augmented Generation (RAG), Semantic
Search, Natural Language Processing (NLP), Research Recommendation System
G
lntellico
lntellico Is on Al-powered web platform designed to simplify, analyze.
and enhance accessibility of dental reseorch papers.
CORE FEATURES
Technology Used:
ITERATION BREAKD0\1/N
Flask, React, Docker, Hugging face, Python
Supervisor Name:
Ms. Marium Hida
Group Members:
Haris Ahmed (22i-1124)
TOOLS &T ECHNOLOGIES
SUPERVISOR
• Hugging Face \..Flask MsL4nrium""b Mattee ul Haq (22i-0989)
Flask TEAM MEMBERS
~React i" python . M A o b r d is u H A o h h m V e O d s l' ( n 2 " (r -1 . 1 ?4 J ) . 5l Abdullah Yasin (22i-1135)
M<Xtee U Haq (22i-C939
FAST NUCES ISLAMABAD CAMPUS

Tennis Vision
TennisVision is an intelligent match analysis system designed to convert raw tennis match footage
into actionable tactical insights. The primary objective is to provide players and coaches with a
data-driven understanding of match dynamics and strategic patterns. The system processes
match videos through a computer vision pipeline that handles continuous ball tracking and player
detection. By applying pose estimation, the system extracts detailed body mechanics to
accurately classify different shot types. These tracking components enable precise rally
segmentation, automatically breaking the match down into distinct events. The final system
translates this structured data into clear, actionable insights through visualization dashboards,
offering an objective evaluation of technical performance.
Features include:
• Processing raw tennis match footage uploaded to the system.
• Continuous ball tracking to map trajectories.
• Player detection and tracking across the court.
• Pose estimation to extract player body mechanics and joint movements.
• Shot classification to categorize different types of tennis hits.
• Rally segmentation to break the match down into distinct temporal events.
• Generation of actionable tactical insights and visualization dashboards.
Key Words: Computer Vision, Pose Estimation, Shot Classification, Action Segmentation, Sports Analytics.
INTELLIGENT TENNIS
MATCH ANALYSIS
SYSTEM
GUPGRVIGOR·
TennleVlalon ...M. UltJ, ,.o....L. _ M , ,. . _ .. H ,, M .,.,. < .-Q .i. U , . R ;. : .. > . C. . U ...> . " U v. '" .v l . " . P) . .. H ' . - .. < .. - A .... . H . . N. . . .E i . . . ,, , ,- :, . .~_ . .D _. . ... . , '. . . < E. 'l . J . 1(, .R >• . '. ,> . . o G .. A . . o . ... ,> .
Technology Used:
PRO.JECT OVERVIEW: ,D/\TA INSIGHT
. T l n::: n ,-l c ", , \r . , n 0 l f g 1' n c. - h , l ,; ~ . T ,- 1.m , ,e V . ,,= . t l , o h .n, l r , o r . = ,. n :- u :. -. c .g1 o .,h n .. : v ..c c ,, , , c · . t .., c .m. : :. p > u , r ~ •..: T : 1 :, , . v :, , , . , y , r , .. n - v .,, - ~ . l o ,d ~ t . o e c :. n , t . , .. . : r , u o ~,-.: o 0lr1 r .,, o g,, . o ..,.... c .= L T I ,o n fO , t , o M r . , , : ~ : . , .. c , . . , t . .. g -. l .. o m .. , n 1 . .c . o . . - , ,, - b . , , t ·, ' l , .: c . , T L . l c 1 o : : . o ,..: n I c • t lcol Python, OpenCV, PyTorch, React, Node.js,
PostgreSQL, MongoDB
PIPELINE FLOW:
Supervisor Name:
. :'°.!.-"~~~.;;;::-!:-~';'~. Dr. Muhammad Asif Naeem
".'.,~._ v.,'.r c,. , ,_• .,.. ",. " ,,..~ .uM' , " f. ",. "w.. '" .o ' , "l.- . ' . u. ,,--n Group Members:
I
Abdul Wasay (i22 - 1198)
E.>,.....-,,,-a.,. ......_. ,., _n_oc .a,to,~
,.% Adeel Mahmood Ansari (i22 -0979)
........ . ... .., ..,, .., ... , .., .., ~... -,. . . . , . -, , ,,.= . . .- , . . . . . , . ,.. . .,.. . o.. , -. -.. ~ ... ..- 0. .... . Muhammad Shaif lmran (i22 - 1024)
TOOLS & TECHNOLOGIES USED:
FAST NUCES ISLAMABAD CAMPUS

Dementia Next
An Al-assisted dementia screening system is being developed, whilst keeping the perspective of
clinicians and patients. There are two views of this app -Clinician View and Patient View - the
former is for clinicians/radiologists to upload MRI brain scans, run automated preprocessing
pipelines, review Al-generated dementia predictions with calibrated confidence scores, view
explainability visualizations highlighting critical brain regions, add clinical notes, and export FHIR-
compliant diagnostic reports in PDF or JSON format. The system uses a deep learning model
(ResNet-34) to perform binary classification (Dementia vs Cognitively Normal) and, upon dementia
detection, further classifies the subtype (Alzheimer's Disease, Parkinson's Disease, or
Frontotemporal Dementia). The latter is for patients/caregivers, who can access a patient portal to
view simplified plain-language summaries of their diagnostic results and interact with a
informational chatbot to ask common health-related queries, with appropriate disclaimers and
escalation messages for clinical questions.
Features include:
- MRI-based dementia detection and subtype classification using a trained CNN (ResNet-34).
- Complete MRI preprocessing pipeline including DICOM-to-NlfTI conversion, skull stripping, bias-
field correction, spatial normalization to MNI space, and intensity normalization.
-Explainability visualizations highlighting important brain regions influencing the model's diagnostic
decisions.
-Clinician dashboard with patient filtering, report search, clinical note-taking, and role-based secure
access.
- FHIR-compliant DiagnosticReport generation with LOINC/SNOMED codes for interoperability with
external EHR systems.
- Patient portal with plain-language diagnostic summaries and a rule-based informational chatbot.
Key Words: Deep Learning, MRI Neuroimaging, Dementia Detection, FHIR Interoperability,
Convolutional Neural Network (CNN)
Technology Used:
PyTorch, ResNet-34, Pandas, scikit-learn,
PostgreSQL, HD-BET, Django, Java-Script
Supervisor Name:
Dr. Ahmed Raza Shahid
Group Members:
Ibrahim Ahmed Lone (i22 - 1193)
Muhammad Owais (i22 - 1123)
Raja Saif (i22 -1353)
FAST NUCES ISLAMABAD CAMPUS

|     | EstateMate - |     | Smart Real Estate Automation System  |     |
| --- | ------------ | --- | ------------------------------------ | --- |
EstateMate is an intelligent real estate lead and workflow management platform designed to serve as a 24/7
Al assistant for property agents. At its core is an advanced Natural Language Processing (NLP) engine capable
of understanding complex user commands and client inquiries in both English and Roman Urdu.
The system provides a unified interface that empowers realtors to automate their daily operations, instantly
schedule appointments via Google Calendar, and use intent classification to automatically generate and
track leads from raw text. By transforming unstructured, bilingual conversations into structured, actionable
data, EstateMate eliminates manual data entry, intuitively filters property databases, and ensures no client
follow-up is missed. The platform operates primarily through automated natural language workflows, while
seamlessly offering manual overrides to give the agent complete control over their lead pipeline.
Core Features include:
•  Bilingual (Urdu & English) NLP engine for intent classification and named entity recognition (NER).
•  Automated processing of natural language commands to execute daily real estate workflows.
•  Smart appointment scheduling with direct Google Calendar API integration.
•  Automated lead creation, intelligent scoring, and follow-up tracking.
•  A single, centralized agent dashboard for seamless oversight of clients, properties, and daily tasks.
Key Words: Artificial Intelligence, Natural Language Processing, PropTech, Lead Automation, Real Estate
Management, Workflow Automation.
| ·,;;- |     |     | I, .....: ~ : --.:;·- | ,   |
| ----- | --- | --- | --------------------- | --- |
ESTATE MATE
|     |     |     |     | -,;-.·~,  ;;:-··  |
| --- | --- | --- | --- | ----------------- |
"  ':__~
-·
OhJectives
| · - ·   - - - - -                                              | .   - .   - . . . . . . . .                                           |   .   - - | . . . . . . . .                                   | . . . . .. . . . . .  · - · · · · - ·                       |
| -------------------------------------------------------------- | --------------------------------------------------------------------- | --------- | ------------------------------------------------- | ----------------------------------------------------------- |
| .   - ~ . . . · . . - .   - .   ·                              | - · • = - -· • . · . . · . - . . . . . . . . . . . . .  . . _   .   . |   .       | _ _ _  , . _                                      |                                                             |
| · - . .   - ·   . . . .                                        | . . . . . . .   · - . . . . . . . .  .                                |           |                                                   |                                                             |
| -                                                              | . . . . . . . . - . .   · - · - - -                                   | .   :.-   | -. ...  .  ~ ·. ·.   . .  • . .   .:  : · : : ! : | . : . · _ ~ = _ : :.  _ .  _ _ .  . -     . ; n - .: . , .  |
| . . . . . .   ~ - , _ -  . · ·                                 | - - - · · · - · -- · - · ·  . -                                       | . .       | . . . . . . .   . .  .                            |                                                             |
| .. .. . . .. .. .. .. .. .   ,.   . . ..  "   " " " '."  " .   | . _   _   , . , _   . .   .                                           |           | , _   ,                                           | . _ . ,   . , _                                             |
,
Technology Used:
React.js, Flask (Python), MongoDB, Natural
Language Processing (NLP), Google Calendar
API, JWT Authentication, GitHub
Supervisor Name:
Ms. Laraib Afzaal.
Dr. Omer Baig
Group Members:
Usman Nadeem (i21-2985
Tools
Saaim Asad (i21-0533)
Shayan Rauf (i22 - 0903)

FAST NUCES ISLAMABAD CAMPUS

GlacioWatch
GlacioWatch is a predictive decision-support dashboard developed to assess Glacial Lake Outburst
Flood (GLOF) risks in the northern regions of Pakistan. This project leverages satellite data, climate
variables, and machine learning models to predict and monitor GLOF risks, providing short-term
forecasts (3-5 days) and daily risk levels. By integrating data from multiple sources (e.g., IMERG,
ERAS, Sentinel-2), the system offers a comprehensive and actionable view of GLOF risk, enhancing
disaster preparedness for local communities, government agencies, and NGOs.
Core functionality:
- Real-time data ingestion from weather stations and satellite imagery.
- Predictive machine learning models that generate GLOF risk scores (Low/Medium/High)
-An interactive dashboard to visualize risk levels, trends, and historical events.
- Exportable reports for internal analysis and community awareness.
Supervised by: Mr Majid Hussain
Groi.c> Members:
Adr•1) H.ty11t :Zli-O:iT8
M c»r'\~l "T31'11r 211•:Z•eg
S)C<I '1aroc;n R.i~ll 221 25:S!I
GlacioWatch
Safety Threugh Forasight
Gl~c:10Wi1tch addresses the lac;.k of prec;11ctive sy5tems
for-(';l:u-:1.,11 I ;tkP Onthurc;.t Floor1o; (C.I OFo:;) in P;:ik1<:.t::.r1
by lovcragmg m::.chil,~ laarning (ML) :>'ld !:atcllita
data. Technology Used:
Python, React, FastAPI, TensorFlow,
GLOP £orly
~ Warnln~System Google Earth Engine
Supervisor Name:
Mr. Majid Hussain
Group Members:
Adnan Hayat (i21 - 0578)
Syed M. Danial Tahir (i21- 2489)
J,'eatures 'l'ech Stack
Reportila And Data Syed Haroon Rasheed (i22 - 2555)
Export
lnteracitve Map
MultHanguage
Support
R ,.
~'Id' Live Cata Ingestion 0
and Pre-Processing
Q:~' Re-~Hime Ri!k
\.\ Monitoring
-mil,., Daily OLOF Risk 0
P1edict1on
FAST NUCES ISLAMABAD CAMPUS

SurveilX
SurveilX is an Al-powered, agentic surveillance platform designed to transform passive video
monitoring into proactive security management. Built with a focus on retail environments like
grocery stores, the system integrates computer vision and agentic Al. The platform offers a unified
dashboard for security staff to monitor live camera feeds, visualize real-time threat classifications,
and manage restricted and loitering zones. By leveraging state-of-the-art vision models, the system
autonomously identifies suspicious activities, classifies risks using a color-coded framework, and
executes context-aware responses such as LLM-generated talk-downs or automated alerts.
Furthermore, a forensic intelligence module allows for post-incident investigations and automated
report generation.
Features include:
- Real-time human detection, tracking, and behavior analysis such as restricted area breach.
- Dynamic 4-level color-coded risk classification (Green, Yellow, Orange, Red).
-Agentic Al responses including autonomous LLM-generated audio talk-downs.
-Automated incident report generation with video evidence clipping.
-Centralized interactive dashboard for live monitoring and restricted area configuration.
Key Words: Computer Vision, Agentic Al, Surveillance, Threat Detection.
Technology Used:
YOLOv8, OpenCV, Python, FastAPI, React.js,
MongoDB, Milvus, lnsightFace
Su ervisor Name:
Dr. Basharat Hussain
Group Members:
Raed Sajid (i22 -0968)
Amir Akbar (i22 - 1112)
Guizar Amin i22 -8810
FAST NUCES ISLAMABAD CAMPUS

RealAssist -Al-Powered Real Estate Automation
RealAssist is an Al-powered real estate automation platform designed to simplify investment management
for clients and real estate administrators through a modern Saas web application. The system provides two
main interfaces - Client View and Admin View - enabling efficient communication, investment tracking
1
and automated business operations within a single platform.
The Client View allows investors buyers, and overseas clients to monitor their real estate investments
1
through an interactive dashboard. Users can track project progress, view installment payments, access
transaction ledgers, and receive real-time project updates. The system also includes an Al chatbot assistant
that provides instant support and answers user queries in natural language.
The Admin View is designed for developers and sales teams to manage business operations efficiently.
Administrators can monitor leads using Al-based lead classification manage customer profiles, track
1
payments, analyze engagement metrics, and view business analytics through interactive dashboards. The
platform improves transparency, automation, and decision-making in real estate management.
Features Include
• Al chatbot for real-time user assistance and support
• Client dashboard for investment tracking and project monitoring
• Installment payment management and automated ledger system
• Real-time project updates with milestone tracking
• Al-powered lead classification (Hot/Warm/Cold/Dead)
• Adm in analytics dashboard with KPls and engagement metrics
• Customer and payment management system
• Secure role-based access for clients and administrators
Key Words
Artificial Intelligence I Saas Platform I Real Estate Automation I Web Application I Investment
Management
Technology Used:
Front End:
React 18
Typescript
Tailwind CSS
Back End & Services:
Node.js
Supabase (Database)
Mock API Layer
Al & Data:
TensorFlow (ML Model) pandas (NLP)
LangChain (RAG Pipeline)
ChromaDB (RAG DB)
Testing: Playwright
Supervisor Name:
Sir Sarni Ullah Shah
Group Members:
Areez Abdullah (22i-1090)
Qasim Hassan (22i-1006)
Muqarrab Ahmad (22i-1351)
FAST NUCES ISLAMABAD CAMPUS

WebVox
WebVox is an intelligent voice-driven chatbot framework that transforms complex websites into
conversational interfaces. Designed for developers and businesses, it converts natural language voice/text
queries into structured GraphQL queries and API actions across e-commerce, booking, and content
platforms.
User View
• Product Discovery: Voice search with RAG-enhanced results
• Transactional Actions: Order placement, booking, modifications
• Real-time Status: Order tracking, availability checks
• Multilingual Support: Natural speech in multiple languages
Developer View
• GraphQL data abstraction layer for partner databases
• Modular API orchestration framework
• Multi-tenant embeddable widget deployment
• Custom action registry configuration
Key Features
• Voice-to-GraphQL natural language translation
• RAG-enhanced retrieval combining vector+ structured data
• Secure multi-tenant API execution engine
• Real-time voice interface with Web Speech API
• Partner database abstraction (PostgreSQL, MySQL, MongoDB)
Keywords: Voice Al, GraphQL Abstraction, RAG Pipeline, NLU Orchestration, Multi-tenant Framework
WEBVOX
A CONVERSATIONAL Al rRAMCWORK
WebVoKp ioneers voice-driven web interactions via advanc;ed NLU,
RAG retrieval GraphQL abstraction, end secure AP1s delivering scalable.
multilingual e>cpertences for seamless search, ordering and tracking.
HOWITWOR~S
Ua.r tf>ffkl A(Ant~ detactA int&nt Con.,.-u into
quo,y (ection/in!Ofmttbn) GnophQL qu&,y
Technology Used:
Repeait tor next Cf,Jery
(Y'ith memory)
Python, LangChain, GraphQL, React, FastAPI
TIMELINE
Supervisor Name:
Mr. Muhammad Farrukh Bashir
S.pt -Oct Nov -Gee Feb -Apr May -Jui
Group Members:
TECHNOLOGY STACK TEAM MEMBERS
22i -0833 Aolyon Ro20 Aalyan Raza Kazmi (22i - 0833)
22i -0977 Sahrish Mustafa
221-1113 Hadiye Tanveer
Sahrish Mustafa (22i - 0977)
SupeNisor
Mr. Muhammad Farrukh Bashir
Hadiya Tanveer (22i - 1113)
FAST NUCES ISLAMABAD CAMPUS

AdalBot: Al-Driven Analysis for Law
ADAL (Al-Driven Analysis for Law) is a web-based application built for lawyers, researchers, and
students to automate legal document analysis within the Pakistani legal context. The platform
offers a user view for uploading documents, verifying legal citations, and interacting with an Al-
powered legal drafting assistant, while the admin view allows for user management and database
maintenance. Users can query legal data, generate context-aware summaries using natural
language, and rely on the system to flag inconsistencies in citations.
Features include:
• Document ingestion with OCR processing for both English and Urdu scripts.
• Automated extraction and authenticity verification of legal citations against a structured
database.
• Retrieval-Augmented Generation (RAG) to summarize lengthy judgments and retrieve
semantically similar case precedents.
• Smart legal drafting assistant for generating structured documents based on user prompts
and retrieved case context.
• Exportable structured legal reports and draft documents.
Core System Workflow:
User Login-> Upload Document-> File Validation-> OCR & Text Extraction-> Clause & Citation
Parsing -> Citation Verification -> Al Analysis & RAG Summarization -> View Results & Export
Key Words: Al Legal Assistant, OCR Processing, Retrieval-Augmented Generation (RAG), Citation
Verification, Legal Drafting.
WHYADAL?
ERROR PAONE,
~----ii SLOW, MANUAL ----~
LEGAL WORK
- -
.
.
Technology Used:
Python, Tesseract OCR, PostgreSQL, Llama 2,
P R R E E T C R E IE D V E A N L T A D S R S A IS F T T A IN N G T KNO C W RA L P E H D GE LegalBERT, FastAPI, FAISS, RAG
Supervisor Name:
_ VE C R _ I I T F A IC T _ A IO T N IO _ N , ..______ FE C A r T i U R R E E / S _,,,. U D PL O O C O A U C O M R W E N IT T H Mr. Muhammad Almas Khan
TOOLS Group Members:
" ff <ffl> O Hasan Ali Syed (i22 -0919)
• ~ ,.~t oo Hasnain Ali Arshad (i22 -1335)
Abdullah Azeem (i22 - 1186)
TAILORED FOR PAKISTANI LAW
FAST NUCES ISLAMABAD CAMPUS

Joblens
Joblens is being developed as an Al-based smart interview and skill gap analyzer, keeping the
perspectives of corporate recruiters and job candidates in mind. There are two primary views of
this platform - Recruiter View and Candidate View. The former allows HR professionals and
interviewers to utilize Al-driven tools to conduct objective interviews, identify technical skill gaps,
and receive detailed, data-backed reports to ensure a fair, bias-free hiring process. If an interviewer
requires further clarification, the system provides a comprehensive "second opinion" based on
candidate performance. The latter is for the candidates, who engage with the Al interface to
demonstrate their skills and experience in a natural, conversational format. The system ensures
that every candidate is evaluated solely on merit, providing a streamlined and transparent
assessment experience.
Features include:
- Al-Driven Smart Interviewing for objective, real-time candidate assessment and interaction.
- Skill Gap Analysis to identify discrepancies between candidate expertise and job requirements.
- Bias Elimination through data-driven reporting to ensure fair and merit-based hiring.
- Comprehensive Evaluation Reports providing a detailed second opinion for HR and stakeholders.
Key Words: Artificial Intelligence, Skill Gap Analysis, Recruitment Automation, Data-Driven Evaluation,
Human Resources Technology (HRTech)
JobLen2'
ARCHITECTURE
--
.........
R41pCWtforMR&
Technology Used:
Python, React, Flask, FastAPI, PostgreSQL,
Whisper, BERT, ResNet
Supervisor Name:
TOOLS
,, \._ff Dr. Zeshan Khan
Team Members Group Members:
1T
Flask 1171409M uh11mmlld AhM5
Muhammad Abbas (i22 -1409)
0 ~ t2 I 296J Shaffln r,,am
1200n7 A)'oobHaroon
Shaffin Imam (i21 -2963)
Su~nlitor: Or. Zeshan Kh~n
Ayoob Haroon (i20 - 0777)
FAST NUCES ISLAMABAD CAMPUS

Real Estate Voice Receptionist
PropTalk is an Al-powered voice receptionist system designed specifically for the real estate
industry to automate inbound and outbound calls, manage property inquiries, and integrate
seamlessly with CRM systems. It uses speech-to-text (Whisper), a fine-tuned language model,
sentiment analysis, and context retention (Memo) to provide human-like conversations, score
leads, update databases, and maintain conversation history. The system follows a modular, scalable
architecture with defined functional and non-functional requirements, structured data design, API
integrations, and comprehensive testing to ensure reliability, performance, and 24/7 automated
customer engagement for real estate agencies.
By reducing manual workload and minimizing missed leads, PropTalk improves operational
efficiency and enhances customer experience through instant, intelligent responses. Its layered
architecture separates Al processing, backend integration, and user interfaces to ensure
maintainability and scalability. The system also supports fallback mechanisms to human agents,
ensuring uninterrupted service even in edge cases. Overall, PropTalk modernizes real estate
communication by combining automation, Al intelligence, and data-driven lead management into
a unified platform.
e
Real Estate Voice Receptionist
Automating inbound and outbound calls with Al to manage
client inquiries and property details efficiently.
ARCHITECTURE
Client Layer _A_t Pro_cess_ing L_ayer _ Backend Layer DepFloroymnteenndt L&a yer
~jh
L. ~• F~..::...J
-'
\,.
Technology Used:
Qwen,Nginx,Docker,Twilio,PostgreSQL,Next
js,Python
Supervisor Name:
Dr. Tajwar Mehmood
Group Members:
TOOLS PROJECT TEAM Wajahat Ullah Khan (221-0776)
-4 • -c:, ® Waj&hat Ull&h Khan 221-0n6
Ahm.ad Aq"' 221-113.4 Ahmad Aqeel (221-1134)
,. Muhammad zayan 221-1010
Owen Docker Nginx Twillo supervised by:
Muhammad Zayan (221-1010)
0,. T.ijwar Mahmood
Oop.wtmcnt ofC omputer SciotlCC
NatioNI Urw&rslty of Computer ~-~nc:a
PostgreSQL Next.js Python Islamabad, Pakfstan
FAST NUCES ISLAMABAD CAMPUS

QueryPilot
QueryPilot is an intelligent desktop co-pilot that empowers users to query, visualize, and manage
relational databases using just plain  English, instantly turning natural conversations into precise
database actions. To overcome the hallucinations of generic Al, QueryPilot uses a schema-aware
engine for guaranteed SQL  accuracy,  paired  with  a deterministic safety guard that  intercepts
destructive commands before  execution.  By  processing  metadata  locally,  it ensures zero data
egress, keeping actual database records strictly private. Ultimately, QueryPilot eliminates the gap
between raw data and actionable insights while serving as a secure, automated administration tool
for technical teams. Features include:
•  NL-to-SQL Translation: Accurately handles complex queries, multi-table JOINs, and
aggregations.
•
Intelligent Prototyping: Conversational schema creation with automated state snapshotting
and rollback scripts.
•
Al Query Refactoring: Analyzes user-provided or legacy SQL to suggest highly performant
optimizations.
•  Proprietary Safety Guard: Intercepts unauthorized data mutations (e.g., DROP, DELETE) to
prevent critical errors.
•
Explainable Al: Comprehensive audit logging and step-by-step query reasoning for full
tra nspa re ncy.
•
Auto-Visualization: Instantly renders query results into interactive tables, bar, line, and pie
charts.
Key Words: Natural Language to SQL, Relational Databases, Al Co-Pilot, Query Accuracy
|                          |                | I  [            | l                  |     |     |
| ------------------------ | -------------- | --------------- | ------------------ | --- | --- |
| Natural Language Prompt  |                | J ~PUT          | Vec:tMStore        |     |     |
| U1tr I111111t            |                |                 | kl'leu( ...N u  •  |     |     |
|                          | I              | ...             | ' I                |     |     |
|                          | •I ----------- | -----------•I   |                    |     |     |
'
'
-
|     | U   | PUCflSINI LlYU  | -   |     |     |
| --- | --- | --------------- | --- | --- | --- |
-~=~:..
| [ ~~m;::::·  | l····I  | =  ]····[  | l   |     |     |
| ------------ | ------- | ---------- | --- | --- | --- |
MfnTt'lSl.tfleetny lG\oudatoe<r
| .., t.c!lh it.tr-:a...-a\  |              | Lan,gCtllllft  LUI C r1  |                                  |                                      |     |
| -------------------------- | ------------ | ------------------------ | -------------------------------- | ------------------------------------ | --- |
|                            |              | ..I                      |                                  |                                      |     |
|                            |              | I   .                    |                                  | Technology Used:                     |     |
|                            | •----------- | ·----------•             |                                  |                                      |     |
|                            | .'           |                          | .'                               |                                      |     |
|                            | '            | I ,. .. ,,  [            | '                                | FastAPI, React, PostgreSQL, SQLite,  |     |
|                            |              |                          | E H c u t l o n  O u tp u t  &   |                                      |     |
larget Local Database  A ut o - - - V l -l iJ al lo n   ChromaDB, LangChain
f'0st9r1'  I AAl'tl
Ch~tl · TH\H · ilhtsu\ 11
Supervisor Name:
- OAT.t FLOI  - OUTr>UT /  DB  - SAFETY / BLOC~  Dr. Nauman Noor
I
CORE FEATURES  Group Members:
|                        |     | (ID                      |     | Shahmeer Ahmed (i22 - | 1048)  |
| ---------------------- | --- | ------------------------ | --- | --------------------- | ------ |
| NL-to-SQL Translation  |     | Intelligent Prototyping  |     |                       |        |
Accurately handles complex querkrs, multi- Conversational schema creation with  Muhammad Danish (i22 - 1305)
| table JOINS, and aggregations.  |     | automated state snapshOtting.  |     |     |     |
| ------------------------------- | --- | ------------------------------ | --- | --- | --- |
Hassan lmran (i22 -0813)

FAST NUCES ISLAMABAD CAMPUS

Threat Viper
Cybersecurity analysts spend a significant amount of time reading long text reports to find the
technical details they need to defend their networks. These reports are often unstructured, making
it difficult for security systems to use the information without manual work. ThreatViper was
developed as an automated framework to solve this by turning these reports into clear, machine-
actionable intelligence.
The system uses a modular architecture that combines various Al models to process text. It starts
by using high-precision extraction engines to identify technical indicators like IP addresses and file
hashes. To understand the specific language used in cybersecurity, the system uses fine tuned,
attention and large language models for entity recognition and relation extraction. It then uses a
graph-driven approach to connect these entities, showing how different threat actors relate to
specific malware or attack methods.
To provide a deeper understanding, the system uses machine learning models to interpret the
narrative and map behaviors to the MITRE ATT&CK framework. The final output is organized into
standardized STIX 2.1 objects and a unified knowledge graph. This allows security tools to integrate
the data instantly into their threat detection and response tools, reducing manual effort and helping
organizations respond to cyber incidents much faster.
Features Included
• Rule-based extraction of technical Indicators of Compromise like IP addresses and file hashes.
• Machine learning-based Named Entity Recognition fine-tuned for cybersecurity terminology.
• Graph-driven relation resolution to model complex linkages like actor-to-malware attribution.
• LLM-supported semantic inference for narrative interpretation and mapping to MITRE ATT&CK.
• Generation of standardized STIX 2.1 compliant objects for interoperable intelligence exchange.
Threat Viper
To automate the transformation of unstructured reports into
octionable STIX 2.1 intelligence for proactive threat detection
and response, using ML models and graph structure
ARCHITECTURE
TIMELINE
Technology Used:
Python, Flask, Kaggle, STIX, Visual Studio,
Hugging Face
Supervisor Name:
Go<hon"1 UM boHG - Turing $TI)( OeplQymoo~ Sl!M
dolOHt, Rule Ertroetiot\. 2.1 complionc•. lntegrotiof\ h.Uti
ond N.P boce,d Knowlodgo g,oph A:ocukc Ropo,1 knowlOdgO Dr. Zafar Iqbal
extrocuon construction CompariSon enlietvnenl
TOOLS Supervisor
,o r ...!!11 - 11 Group Members:
ISTIXI Dr. Zafar Iqbal
Team Members Muhammad Muneeb UI Haq(i22- 1321)
~laskkaggle
Muneeb UI Haq(i22-1321)
WSIEM Ameer Hamza (i22 - 1354) Ameer Hamza Khan(i22 - 1354)
Faizan Liaqat(i22 - 1197)
Faizan Liaqat(i22 - 1197)
FAST NUCES ISLAMABAD CAMPUS

Smart Order
SmartOrder is an Al-Powered Urdu Voice Ordering Assistant designed to help restaurant customers and
the restaurant management with a fully voice-based ordering and reservation system for food. The
application has been created specifically for Urdu and Urdu-English Bilingual speakers, bridging a gap
with existing English-only voice assistants, particularly in the presence of noise in a restaurant.
There are two main perspectives of looking at the system, one is Customer View and the other is
Ad min View. Customer View is for allowing people to order, modify or cancel their orders, reserve
tables, check the status of an order and conduct simulated payments as well as provide feedback, all in
natural spoken language (Urdu, English or mixed). At every interaction, the system takes spoken input
(in Urdu or English or both), converts it to text using an ASR system that has been trained using
fine-tuned models specific to the SmartOrder vocabulary, determines the intent of the user (e.g. place
order, modify order, cancel order, etc) and extracts key entities (item(s), quantity, time, etc) from the
spoken input, and confirms to the user via audio that the required action has been taken.
The Ad min View is for empowering restaurant management personnel to manage customer orders
received, change status of customer orders, manage table reservations, manage menu items and track
customer feedback and other relevant statistics. If the user has given a voice input that the ASR system
has incorrectly recognized or if the ASR system fails to recognize the user's input the SmartOrder
system will provide the user with a request for clarification and data for prior user interactions is
available to the ad min console for updating the correctness of responses for future transactions.
Features include: Voice-based ordering, intent detection, entity extraction, reservation management,
simulated payment processing, feedback sentiment analysis, and real-time database integration.
Key Words: Urdu Speech Recognition, NLP, Voice Ordering System, Firebase, Dialogue Management.
Smart Order
ARCHITECTURE
Technology Used:
Front<nd, Flutte, _ , Ba,·kend,Fireb"'e
User-f11eng vo,ce UI A visual a.~
Ofdef,ng A-M. Clovd Firintore, re;iiltime sync Python 3.11, Flutter, Dart, Whisper, VS Code,
Jupiter Notebook
Onfaolration,LangGmph Al,WM,pe,(fine·tuned) Supervisor Name:
D»logl~•• :::::::: ~ · U. .< >IE"9l,h•ml," ASR
Ms. Hina Binte Haq
TM cycle above how UMr vdc• input is Captl.lf~ by the FlllttCf fl'on.tend, sent to the WMJ)ef A.SR, orchestrated wilh
LangG!'al)l'I and perti$l8d/'41fWG Ilia Fireb8i8. Group Members:
TIMELINE Umar Tanvir (i21-2956)
D 2 3 4
Shahzor Khan (i21-2594)
ltt>ration 1 lll'r.tlion 2 ltt'r.oion 3 ltt":nttion4
P,~-~~s. Nlu r.'°°"11, Basie W'ttl§J)Ql' .. TTS,MulT Paymem Slmul.111on,Error Shayan Salam (i21-2964)
dat11set, it..SR tes1 ng Chstbot. 6Kk8f'd s91up, Agent OfchMt11tiof1, h900kog, 61\1 lesling
M-"'1> Tt,ble Rese,V<1toon
TOOLS
@ m
"
Flutter Firebase Wlihi~r LangGraph
Crou·platf«mUI AIAtl&Firuto,e Fine·tuned ASR OrctMwation I prompts
TEAM MEMBERS
Core Team Supervision & Session
Supervised by: Ms. Hina Binte Haq
• Umar Tanvir 2~1-2956
• Shahzor Khan 211-2594 Session: 2025-2026
• Shayan Salam 211-2964
FAST NUCES ISLAMABAD CAMPUS

Predict PD+
Predict PD+ is an Al-driven bioinformatics platform that forecasts Parkinson's Disease progression
by analyzing proteomic biomarkers. It utilizes high-dimensional protein and peptide abundance
data to provide quantitative UPDRS score predictions, replacing subjective clinical observation with
objective molecular analysis.
The system features two primary interfaces:
• Clinician View: Facilitates real-time progression forecasts and biomarker visualization from
patient samples.
• Admin View: Enables model weight tuning, dataset updates, and performance
benchmarking.
Features include:
• Advanced Ensemble Model: Custom stacking regressor (XGBoost, LightGBM, RF, and
ElasticNet) achieving a 15-25% SMAPE improvement over 2025 SOTA benchmarks for
UPDRS 1-3.
• Specialized UPDRS-4 Logic: Two-stage modeling (Classification + Regression) to accurately
handle zero-inflated motor complication data.
• Multi-Omics Integration: Seamless merging of mass spectrometry (Proteins/Peptides) with
clinical patient history.
• Real-time Flask Web App: A user-friendly interface for on-the-fly CSV data uploads and
immediate prediction output.
• Automated Feature Engineering: Implementation of peptide aggregation, PCA, and Robust
scaling to extract high-variance biological signals.
PREDIC::::TPD-+-
---------------~---------- --
- -- ~ - - - - - - ----- - - ---- - -- - -·--
..,_.c:»D EL DESIC3N
_____ _
_____ Technology Used:
..... Python, XGBoost, LightGBM,
RE:S.E..A,._R:C::H C>B-.;:J E-c::'"T-I-V--E-S --
-_-_-- -----=-·-=
=---~----_-=-_-_-=·._- _ TensorFlow/Keras, Flask, RobustScaler,
·-=-=·---=-=--=-=----_.._::-__
---~------------------------------------
Principal Component Analysis (PCA)
...
~~T't...JAc.-I-...S-. - ~~-- Supervisor Name:
-- Dr Labiba Fahad
Group Members:
A.PPLIC:.A""T'IC>NS
Talha Ahmad (i22 - 0760)
---
-·-·-
Omer Mustafa (i22 -1180)
TEC:::HNC>LC>,Gli,V
C)C> J«GIII
Muhammad Abu Bakr (i21 -1691)
FAST NUCES ISLAMABAD CAMPUS

TraCC: Transformer based Comment Classification
Code comments are a fundamental part of software documentation, yet classifying them
automatically remains difficult due to severe class imbalance and the computational cost of large
language models. Trace addresses this by training a CodeBERT teacher model and distilling its
knowledge into a compact TinyBERT student model, achieving 88% parameter reduction while
retaining 91% of the teacher's performance.
The system classifies comments across Java, Python and Pharo spanning 18 categories. To handle
minority classes representing as little as 1.2% of the data, the pipeline combines targeted data
augmentation using Google Gemini, asymmetric focal loss during training, and per-label dynamic
threshold optimization at inference. Trained on an augmented dataset of over 12,000 samples, the
student model achieves an Fl score of 0.671 at just 481 GFLOPs and 0.565 seconds runtime,
earning a competition score of 0.761 at the NLBSE'26 Tool Competition and outperforming the
SetFit baseline.
Keywords: Knowledge Distillation, Code Comment Classification, Transformer Models, Class
Imbalance, Multi-Label Classification
Technology Used:
CodeBERT, TinyBERT, Google Gemini,
HuggingFace Transformers, PyTorch, Optuna,
P than
Supervisor Name:
Mr. Pir Sarni Ullah Shah
Grou Members:
Abdullah Ashfaq (i22-1149)
Dilawar Shah (i22-0884)
Ahmed Fasseh (i22-1259)
FAST NUCES ISLAMABAD CAMPUS

CodeForge-An Al Driven Multi-Agent System
Al-Powered CodeForge is an intelligent automated code refactoring system designed to improve
software quality while preserving program functionality. The system follows a multi-agent
architecture where specialized agents collaboratively analyze, refactor, verify, and safely deploy
improvements to Python codebases. It integrates with developers through a CLI tool or VS Code
extension for seamless workflow integration.
The Analysis Agent detects code smells, complexity issues, and security vulnerabilities using
static analysis tools. The Refactoring Agent applies safe AST-based transformations such as
variable renaming, dead code removal, and logic simplification. The Verification Agent executes
automated tests and measures coverage to ensure behavior preservation. If tests fail, the Git
Rollback Agent automatically restores the previous stable version, ensuring reliability and safety.
The system generates measurable quality improvements, including reduced complexity,
improved maintainability, and enhanced test coverage.
Keywords:
Mui-Agent Systems, Automated Refactoring, Static Code Analysis, AST Transformation, Software
Quality Improvement.
la£r
CODEFORGE
An Al-Driven Multi-Agent System
i +PIHMW
COOtfOf9t • an Al~ muNj-Ogtm syscern ottlQMd 10 outornoucctty onoJytt one1 ,..octor f'ytl'IOn
coct., lmp,o"4ng molntolnobllty, f'llduclng t«tlricol debt, ond enfOtdng dilon dMlg,t, pdnclpl,H
ARCHH~CTURE
Technology Used:
Python, Git, Pylint, Pytest, LibCST, Radon,
Coverage, Visual Studio
Supervisor Name:
Mr. I rfanullah
___ ___
ITt.RATION 1 ITERATION 2 IU:RATJON 3 ITERATION 4
Group Members:
·_-_-- llilEII.I,_ . Ema l:!Jilla
:=..,: .. . - . . - .. - .., - _ - -- . . . . . . . .. ... , • _ YI . ( . _-. .. . .. . .-,. , .. . . . . . .. . _ .. _ ,. _ _ . . , . . .. _ .... . .. .. Ali Haider (21i-1522)
, •0.,,--.,... ....... ·'
,..
- ..-.. -.--.
..
. ·..,._
TOOLS & TECHNOLOGIES Arsal Mairaj (21i-1520)
t9 -0,git ,. Pylint P LibCST
Abdullah Dilshad (21i-0418)
- ---- pytes.t
FAST NUCES ISLAMABAD CAMPUS

FLO: Flow Through Local Opportunism - Hybrid Traffic Simulation Model
Modern urban traffic systems are highly complex and  heterogeneous, particularly in developing countries where
different vehicle types interact dynamically on shared road networks. Traditional traffic simulation models often
struggle to  realistically represent these  interactions.  FLO (Flow Through Local Opportunism) is  a hybrid traffic
simulation engine developed in C++ that integrates continuum-based traffic flow modeling with agent-based vehicle
behavior. The system allows vehicles to make opportunistic local navigation decisions while still following global traffic
flow dynamics.
The  developed  engine  is designed to integrate with Simulation of Urban Mobility (SUMO),  enabling advanced
experimentation within an established traffic simulation environment. By combining a custom traffic behavior engine
with the SU MO simulator, the system enables realistic modeling of heterogeneous traffic, congestion patterns, and
dynamic vehicle interactions.
This platform can support research in urban mobility, smart city planning, traffic optimization, and autonomous
vehicle testing by allowing researchers to simulate and analyze complex traffic scenarios efficiently.
Features include:
-Custom hybrid traffic simulation engine implemented in C++.
- Integration with SUMO for large-scale traffic simulation environments.
- Hybrid modeling using continuum flow fields and agent-based vehicle behavior.
- Dynamic vehicle navigation using local opportunistic decision-making.
-Visualization and analysis of traffic flow and congestion patterns.
Key Words: Traffic Simulation, C++ Simulation Engine, SUMO Integration, Agent-Based Modeling, Urban Traffic System
FLO Supervlsoc,
Dr. lmran A.5hraf
Dr. Sohialb Khan
Flow Through
Local Opportunism
| • Hybrid trillffic cimulation •ngine o:kvelos:ed in C+•  |     | supervisors:  |
| -------------------------------------------------------- | --- | ------------- |
Ur. lmran Ashraf
• Curnbines contini..-..-n traffic flow modd.il'ty
| with aoent-t::ased vehide behavior                        |     | Or. Sohalb Khan  |
| --------------------------------------------------------- | --- | ---------------- |
| • v ..h id..-... mr1kP lt;>Cal opportunistic na11igation  |     | Group Members:   |
decisions
T;iitw::h f".Jrlm;,in Kh;,in (i,,-OA11)
| • lnt<egr(lted with SUMO (S111ulatJOn of Urben Mobity)  |     | Mut,.-1111111;.icl Danisti H;iruon  |
| ------------------------------------------------------- | --- | ----------------------------------- |
| • Enables realistic large-scale traffic slmUlcUon       |     | (i22-Q9SO)                          |
Arqam Zio {122 ff70)
• RQal-world traffic is hoterog9n90us  • BuLd hybrid traffic simulation enginQ  Technology Used:
| • Trad ti,:w,al simut~torsr...-nn4't ,:-,.-pturP  |     | • C:omh1nP l"'T1ontin111Jm -'lnrl ~9pnt-h;:ritj>(1  |
| ------------------------------------------------- | --- | --------------------------------------------------- |
| c.v1nplo::,,.,. into&rac.tu:,ns                   |     | ITIOdel!!o                                          |
• Need scalable and realistic traffic  • Implement system in C+ ..  C++, Traffic Simulation Algorithms, SUMO
| models  |     | • lnt.~n11tewith SUMO  |
| ------- | --- | ---------------------- |
• Ua:Qful br smart city re.liarcll
• SirrLtllle realistic conge::.liun ~ll,m~  Simulator, Agent-Based Modeling, Traffic Flow
Madelin
..
Road  R.Q'IN Fi-,ld  Ag<,aru.ea,..;,d Oppor"tuni~t:ic:::  C++  SUMO  Tr;;iffic:::  Su  ervisor Name:
| Network  Model  | Vehicle~  N:iv,gotlor,  | Slmubdon  lntogradon V1cuaUZlilltlon  |
| --------------- | ----------------------- | ------------------------------------- |
E1--9i•~
0 •$I091-i§if  Dr. lmran Ashraf, Dr. Sohaib Khan
Toob & Technolo91e:>
| • C++, SUMO Traffic Simulator  |     | • Custom C++ traffic simLJ\atlon ?.nginA  |
| ------------------------------ | --- | ----------------------------------------- |
• Tratt1c Flow Modeling  • SUMO 1nte<,rat1on  Grou  Members:
| • AQ;;int•Based Modeli11c,i  |     | • Traffic simulation environment  |
| ---------------------------- | --- | --------------------------------- |
• Data v1suat1zat1on  • P~rrormancv &valuation  Tabish Noman Khan (i22 -0831)
Future Enhancements
~-Smart City Planning  • Rool tr::iffie OOt:is.c-: k"\togr~tlon  Muhammad Danish Haroon (i22 -0955)
| •  I lrbJ111n Tr111ff1r. AnAlyc;1c;  |     | • Ai-h-Prl VPl-lr-lP hPh;:i'vinr  |
| ------------------------------------ | --- | --------------------------------- |
| a Autonomous Yeh.:le Testing         |     | • Lar9~-sca,1> otys molat•on      |
•~pu•
•  Tl dt  tc,llOI l Re~eorch  • Redl-L111--..t1c1llt1.dc1lc1111teqrat1on  Arqam Zia (i22 -1170)

FAST NUCES ISLAMABAD CAMPUS

LanderNet
LanderNet is a robust, triple-stream deep learning framework designed to bridge the "lab-to-wild"
gap in digital forensics. While conventional deepfake detectors achieve high accuracy on curated
datasets, their performance degrades significantly when videos are "laundered"-subjected to
aggressive compression, resizing, and transcoding on social media platforms like VouTube and
WhatsApp. LanderNet overcomes this by extracting and fusing forensic cues that remain resilient
to these real-world transformations.
• Laundering-Aware Forensics: Multi-stream analysis using Pruned MesoNet (Spatial} and
ResNet-18 (Temporal} to detect resilient forensic traces.
• Codec Metadata Extraction: Real-time retrieval of Bitrate, GOP length, and Motion Vector
dynamics via FFmpeg-integrated pipelines.
• Robustness Gap Evaluation: Automated computation of the Robustness Gap metric to
quantify platform-specific performance degradation.
• Differential Fusion Block: Modeling joint stream evolution through differential equations
to enhance cross-domain discriminative power.
• Dynamic Dataset Optimization: Real-time knowledge base updates and dataset
refinement following administrative correction of failed queries.
Key Words
1. Deepfake Forensics
2. Social Media Laundering
3. Triple-Stream Architecture
4. Codec-Level Analysis
5. Robustness Gap
Technology Used:
Python,PyTorch,Torchvision,FFmpeg,OpenCV,
MTCNN,NVIDIA Tesla T4,NumPy,Pandas,
Kaggle
Supervisor Name:
Ms Ra bail Zahid
Group Members:
Muhammad Zain (22i-0837}
Abdullah Waheed (22i-0765}
Talha Aazim (22i-1243}
FAST NUCES ISLAMABAD CAMPUS

AlertEye - A Smart Home Intrusion Detection System
A smart home intrusion detection system is being developed, keeping the perspective of
homeowners and security-conscious households in mind. There are two layers of detection in this
system - Outdoor Detection and Indoor Tracking - the former uses Al-powered RGB cameras to
monitor the home perimeter, identify unknown individuals, and detect suspicious behaviors such
as visible weapons or forceful entry attempts, triggering real-time alerts to the homeowner via a
mobile app. The latter uses 60GHz mmWave radar sensors to track intruder movement inside the
home without any video recording, preserving the privacy of residents. If an intruder is confirmed
indoors, the system escalates alerts based on threat level. Features include:
• Outdoor perimeter surveillance with facial recognition and suspicious behavior detection.
• Privacy-preserving indoor movement tracking using mmWave radar sensors.
• Federated learning for continuous model improvement without sharing raw household
data.
• Multi-level alert escalation with categorized notifications (Green, Gray, Red).
• Exportable event logs and trajectory replay for legal or investigative purposes.
• Dataset updated through federated model aggregation after each detection event.
Technology Used:
Flutter, Dart, Python, TensorFlow, OpenCV,
FaceNet, NumPy, Kalman Filters, Flower (FL),
.. am
MQTT, AWS, Firebase
Supervisor Name:
TOOLS & TECHNOLOGY Mr. Shams Farooq
Group Members:
-
•
Muhammad Zohaib Raza (i22 -1331)
.,,, ::
Muhammad Awais (i22 -1315)
*
A
Muhammad Umair Nawaz (i22 - 0913)
FAST NUCES ISLAMABAD CAMPUS

Court Ready
The Pakistani legal system is highly complex, making it difficult for the average person to
navigate due to technical language, strict protocols, and the high cost of legal support.
CourtReady solves this by providing an Al-powered platform that simplifies legal
preparation for self-represented litigants, law students, and early-career lawyers. We
bridge the gap by offering accessible, structured guidance that helps users build
arguments, understand legal jargon, and gain confidence through rehearsals.
Features include:
• Case Understanding: Processes case details to identify key facts and generates
a tailored preparation roadmap.
• Document Assistance: Helps draft and organize legal documents while
translating complex jargon into plain language.
• Argument Builder: Guides users in creating clear, logical, and persuasive
arguments for court presentations.
• Simulation Mode: Offers an interactive practice environment using Al questioning
to mimic courtroom scenarios and provide real-time feedback.
• Case Matching: Connects users with relevant past precedents and examples from
Pakistani court data for contextual support.
Keywords: LegalTech, Large Language Models (LLMs), Retrieval-Augmented Generation
(RAG), Case Preparation, Courtroom Simulation, Document Drafting,
Workflow
Technolo Used:
Python, FastAPI, React, PostgreSQL, Tesseract
OCR, Whis er STT, P Torch
Supervisor Name:
PROJECT TOOLS AND TECHNOLOGY ECOSYSTEM
• Ma'am Azka Atiq
• •
Grou Members:
mPython Haris Shahid (i20 - 0663)
React Postgres
@
.Mv1Scrtpt ~ n• Abdul Wasay (i21 - 0291)
CTu•11111>.._..J
CourtReady is an Al-powered legal assistant that streamlines
case preparation for both lawyers and self-represented litigants
FAST NUCES ISLAMABAD CAMPUS

HealthSage: Al-Driven Personalized Decision Support System for
Diabetes Care
D-HealthSage is an Al-driven clinical decision support system designed to assist doctors in diabetes
management.
The system integrates clinical, lifestyle, and biomedical data from multiple datasets to create unified
patient profiles.
A diabetes-specific ontology and knowledge graph are used to model relationships between patients,
symptoms, tre.:itments, .:ind medical conditions.
Machine learning models analyze these structured data representations to predict diabetes risk and
possible complications.
The system also provides explainable recommendations, allowing clinicians to understand the reasoning
behind predictions.
Interactive dashboards allow doctors to explore patient data, simulate treatment scenarios, and monitor
patient health.
Features include:
1. Unified patient record management integrating multi-source healthcare datasets
2. Al-based diabetes risk prediction and complication forecasting
3. Knowledge graph driven reasoning for treatment recommendations
4. Explainable Al insights for transparent clinical decision support
5. What-if scenario analysis for treatment planning
6. Patient monitoring and alerts for abnormal health indicators
Key Words: Artificial Intelligence, Knowledge Graphs, Explainable Al, Healthcare Analytics, Diabetes
Prediction
HEALTHSAGE
ANN DRIVEN PERSONALIZED DECISION SUPPORT
SYSTEM FOR DIABETES CARE
am
J =:•:
0
1:1/:)
P ( A ., T ft A l (. . A ..~ 1 _ -'H . O , N M Q • N CM TU I I.,Q .,,... I.Hc t c • U K II Q J A , . ; I : o l r " , K .,p M I W 0 ~. ( _ . ' . C A .'1 1 r 0 tO ,., N ~ l _ iAP . \ . _ . .. A , . " .. I I " J - ; " - ,Q .& ... A .. l DC~ CUN ,~. KA ~ L ~T5
Technology Used:
Python, PyTorch, Scikit-learn, Neo4j Knowledge
Graph, Protege Ontology Editor, FastAPI, React,
PostgreSQL
F
Supervisor Name:
_ Mr. Muhammad Almas Khan
.. ..
, Group Members:
c;,u,., r!<f 00<.1,,...,
Muhammad Zayyam Hassan (221-1247)
suPe1>v1smsv Muhammad Rayyan (221-1022)
PRESENTED BY
00 Umer Farooq (221- 1007)
FAST NUCES ISLAMABAD CAMPUS

ZareeDost - Al-Powered Mobile Diagnostic Tool for Plant Health
Project Overview
ZareeDost is an Al-powered mobile diagnostic tool for plant health. This mobile application
leverages deep learning to detect diseases across multiple crops using just a smartphone camera.
The application is designed for farmers in remote locations, ensuring offline functionality and
offering proactive disease forecasting based on weather data. It provides real-time diagnostic
capabilities and actionable treatment advice through a generative Al chatbot.
Project Objectives
1. Disease Detection: Develop an Al model capable of detecting diseases in crops like corn,
rice, and wheat from images captured via a smartphone.
2. Offline Functionality: Ensure that the app works without requiring an internet connection.
3. Generative Al: Integrate a chatbot that provides personalized treatment suggestions
based on disease detection.
4. Weather-Based Forecasting: Integrate weather data to predict disease outbreaks
proactively.
5. Multi-Crop Support: Provide disease detection capabilities for various crops, including
corn, rice, and wheat.
Key Features
• Al-Powered Disease Detection: Uses a lightweight CNN model to classify diseases in
images of plants.
• Offline Inference: Ensures that users can access the tool without an internet connection
through TFLite on-device model inference.
• Generative Al Chatbot: Provides expert-level advice to farmers for treatment and care of
crops.
• Weather-Based Disease Forecasting: Uses the ECMWF API to predict and warn users
about potential disease outbreaks based on weather data.
Key Words: Al in Agriculture, Disease Detection,Mobile Application, Generative Al , Weather-Based
Forecasting
._. -N~A. .t..'..-..1 U,n.,i,-~M,y3 •.f .C. .,o ,.n p1u1t•or,&-· ~-c..n,....g,.. ec. ........
l'INALV-.-..CCT us.-.ao1;i,,-a,o.r.
ZareeDost
.-,1• • ..,. ... -,Mn-~-
I> 1.-.o,. ..... _,. ., ,.., ..., __,.,,_,.. ., .,,11 __ --,.__..,_ ....
tr•.t.....,.t~•. -OpCOVOC• p<o~,;- 411 ... M -••UAil -..
•-~o..tiOr ff•lll\eIttofff-lM-')'S~
o :!;-l-
• ::-=::..".... • ::',.~":..~-
,~ -• -c--,.. . ...,,_,, .,,,-
• --·--...... ..; cOtloll,,-.,S.,.,..,_ tt~_•_•-•_-Q_-_ - ---
• •••" ~.,_,__loot.-40-.. .,, Ge_...,.,.,,.., _ _...,_MW•
\lll!Mfl--~..,.,..._1-..1 1o,u
a
otll,Y l'CATVPCS
Technology Used:
Python, TensorFlow, PyTorch,React
I __, .._
•fC'M - f'lf-Prf-w,t,_H.,in_. , •T• .. rto~- Native,OpenCV,T FLite
Supervisor Name:
"88.54o/o "387K
Dr. Zeeshan Khan
• TOOLS a 'UiCMMOI..OCMIS
Group Members:
Hassaan Qadir (21i-0883)
-•--•- - •- - •-
Ahmad Javed (21i-1108)
Ahmad Islam (22i-0603)
FAST NUCES ISLAMABAD CAMPUS

VOICE WEB APP
0-VOICE is a real-time bidirectional translation system between Pakistani Sign Language (PSL),
text, and speech, designed to support deaf/mute users and hearing users for inclusive
communication. The system has two main modules: PSL---+ Text/Speech (user performs signs on
webcam; MediaPipe extracts hand landmarks; a TCN + Transformer model predicts the word with
confidence), and Text ---+ PSL (user types text; backend resolves each word to a matching
animation; a 30 avatar plays animations word-by-word in the browser).
Features include:
• Real-time PSL recognition using webcam + MediaPipe hand landmarks+ TCN + Transformer
model (32 words) with confidence.
• Sentence bui Ider+ text-to-speech output.
• Text-to-PSL 30 avatar animations (word-by-word playback with progress and controls).
• Backend-driven animation registry (JSON) + fuzzy matching to map words/phrases to
animations.
• Clean APl-based integration between frontend and backend (FastAPI endpoints+ Axios
service layer).
Key Words: PSL Translation, Media Pipe Hands, TCN-Transformer, YOLO, Three.js Avatar
B vo,c,
II
VOICE
Bridging Communication Gaps
Features
+
~Ml-tftP!.LR~nitiDn /J?, Rili"Ou•1O utp.n (Urtlu-1::,gll!hl Technology Used:
Ad.ta~M...J'l'NKWrecOQl"ll2esP1knuniSiQ,1LIOQUJQl!I Aut<mabc ! aM&t.or and synthesis ,. bofl Urilu atd &Qlsll
91:nurc:in,c.,fllt.rncwr:hn..,..occ,r'°')'.
Backend: FastAPI, Uvicorn,
~J-...
TensorFlow/Keras, Pydantic,
Q 3C-AOf.ot•rA..nimuion (Cl 1111.C<•CIN'o: Lc:•1 ni,'ll Mud. ...
~;i<;.I, ,nQCk-..,u, Ai ~l<h.-P• -•" "'f>...,.. Python-dotenv
i,p.11/cr~tnn:1&1:IOf'I ~$lol$.
Frontend: React, Vite, Tailwind CSS, Axios
TeKt to PSL
3D/Avatar: Three.js, React Three Fiber,
GLTFLoader, AnimationMixer
EnttrText CV/Models: MediaPipe Hands, YOLO
emted (detection support), TCN + Transformer
Su ervisor Name:
Mr. Almas Khan
lo [,_,lertffl--~.,1,~ ....
bo ~•rW .rill ,~. .§ n N>ffliltKln
Group Members:
Shaheer Zaman (221-0805))
E.;._J - M.Najam Uddin Hassan (221-1332)
CID
Aliyan Zafar (201-2414)
FAST NUCES ISLAMABAD CAMPUS

Flow Mind
FlowMind is an intelligent document analysis system that automatically extracts requirements,
features, and specifications from technical documents and directly assigns it to designated teams.
Designed specifically for Project Managers, Software Engineers, Business Analysts, and Clients, it
addresses the challenge of manually extracting requirements by providing an automated, Al-
powered solution. The system combines Optical Character Recognition (OCR), Vision-Language
Models (VLM), and Retrieval-Augmented Generation (RAG) to deliver 90-95% extraction accuracy
while continuously improving through its self-learning capabilities.
Features include:
Text and image extraction from multi-format documents including PDFs, DOCX, and PPTX. Fast two-
phase image processing combining quick OCR and smart Al analysis Highly accurate requirement
extraction with zero duplicates using hybrid Al methods Automated quality scoring with visual
confidence indicators for extracted requirements. The system adapts and improves extraction
accuracy over time through self-learning.
Key Words: (Al Requirement Extraction, Retrieval-Augmented Generation (RAG), Vision-Language
Models
(VLM), Optical Character Recognition (OCR), Semantic Search)
Technology Used:
Python 3.9+, FastAPI, Uvicorn, SQLite,
SQLAlchemy, ChromaDB, LangChain, Sentence
..
·--~-·,-•.......-..
Asslgnlft9 u,.,.,. Transformers (HuggingFace), Tesseract OCR,
. ~, .
Ollama (Local LLM/VLM), PyPDF, python-docx,
OpenCV, Pillow, Vanilla HTML/CSS/JS.
Supervisor Name:
Oat• StoPag• l.ay•r
i :..<>:~~::-· I -t <:::::-:::0 • 11 • :-~-;;=- Ahmad Raza
Group Members:
Muhammad Zain (i21- 2507)
Musa Nasir (i20 - 0924)
FAST NUCES ISLAMABAD CAMPUS

Zaviyah
An Al-powered ETL and Machine Learning platform built for data engineers, scientists, analysts, and
system administrators. It offers two core workspaces, Workflow Management and Analytics &
Modeling. The Workflow Management workspace lets users visually design, configure, and monitor
ETL pipelines, with the ability to auto-generate a ready-to-run ETL script that can be downloaded
and deployed anywhere. The Analytics & Modeling workspace gives users access to processed
datasets, training jobs, model evaluation, and visual dashboards all in one place. The platform also
handles logging, error catching, and automatic retries, while administrators manage user roles,
resources, and security to keep everything reliable and scalable.
Features include:
• Designing and executing ETL pipelines with automated generation of complete executable
ETL scripts.
• Integration with multiple structured and unstructured data sources.
• Machine learning model training, evaluation, and version management.
• Data profiling reports and visualization dashboard integration.
• Role-based access control, logging, and monitoring for system governance.
Key Words: ETL Automation, Script Generation, Machine Learning, Data Pipeline Orchestration,
Model Versioning
-
-
.,....,.,,__,..~-no000t
11
. -
1,
.
1
~
i
.
1
_
0
.
0
,
1_
,
t,. ._..
,
- o
..
a
,
p
_.
1
.
4
_.
C _
_
fln_
_
lC_
_
._ II
. .. , ,10..-........__.......-_.,_,..
--- -..w.~,,_,..... ...........
""-•. .... Ch(OlllllQ.-:ttrom ./ .....,_Cn•MLh_........,
.
~-- -
.. .
1-
--
-
··
-
=
... -
1""-""'-
NO-COCM.-n....-0•1u11
1-~~·P-f'-OC. ...
1=---
- Technology Used:
..
.......
~fD otclbo. ./ Doto~ 1--··-
Python, React, PostgreSQL, Pandas,
Tensor Flow, VS Code
[ Supervisor Name:
Mr. lrfanullah
Group Members:
@ O ·.; 6 t
Abbas Rizvi (i22 - 1376)
•• OJ t rU11tll .. ,
Hashir Khan (i22 - 0754)
tll
Mahtab Ahmed (i22 - 1284)
FAST NUCES ISLAMABAD CAMPUS

MedScholar
Medscholar app is being made, whilst keeping the perspective of medical professionals and clinical
researchers. There are two core parts of this app Application Layer and AI Engine the former is for
the users to interact with the features provided by our app to seamlessly manage chat history.
authenticate via Google Login, perform real-Lime PubMeu searches, use agentic medical
calculators, and access the supplementary Medfinder database for fonnula and disease-based dmg
lookups, in natural language i.e. English. The latter is for the system Al Layer, which will process
complex medical queries using a "From Local to Global" Hybrid Graph-Vector RAG approach
(combining Neo4j and FAISS) to provide highly accurate, reference-based answers equipped with
explicit reasoning to eliminate hallucinations.
Features include:
Reference-based answers with advanced reasoning using a Hybrid Knowledge Graph-Vector RAG
architecture.
Supplementary Medfinder database for structured drug lookups and medicine alternatives.
Prescription assistant for contradiction and interaction checking between prescribed medicines.
Real-time clinical aiticle fetching and live literature searches directly from PubMed.
Agentic integration of medical calculators summoned dynamically based on user chat que1ies.
Key Words: Hybrid RAG, Knowledge Graph, Clinical Decision Support, Large Language Models,
Neo4j
MedScholar Medsch $ o . l ar
' Medical Al~
Al-driven Clinical Research Tool with Hybrid Graph RAG for
accurate, reference-based medical knowledge.
Technology Used:
Python, React, PostgreSQL, Neo4j, FAISS,
Docker, Ollama
TIMELINE
®0- -®0- -@0- ~G)- -®o- ~®o- Supervisor Name:
Dr. Zeshan Khan
ocrol!fi l«IYIMIEH DICENBIR·J.INUARY FEB!UIIIT·MARCH ffll[l MAY
Group Members:
D~=-s1l4) FfMl~~kend ~~~RAG
MOBILE APPLICATION Muhammad Khan (i22 -1040)
Muhammad Ahmed Mufti (i22 - 1088)
Ubaida Tariq (i22 - 1155)
FAST NUCES ISLAMABAD CAMPUS

HorizonSec
HorizonSec is an Al-driven endpoint threat analysis tool specifically for Windows 10 and 11,
designed for non-technical users to help them understand and assess security risks without
requiring deep cybersecurity knowledge. The system scans the computer to identify system
vulnerabilities, monitor for malware and unauthorized access, and provides an intuitive interface
with easy-to-follow reports, making cybersecurity awareness accessible to everyday users.
Key Features:
• Vulnerability Assessment: Automated scanning to check the system against a CVE dataset.
• Hybrid Malware Detection: Identifies threats using a dual-method approach of signature
comparison paired with an Al classifier.
• Attack Simulation: Safely executes more than 100 simulated adversary techniques to test system
defenses and educate users without causing actual harm.
• Al-Powered Report Generation: Uses a RAG engine to translate complex technical data into
personalized, plain-English summaries and mitigation steps.
Key Words: Python, Flask, ChromaDB, RAG, Threat Intelligence, Attack Simulation
Technology Used:
Python, Flask, ChromaDB, HuggingFace,
Atomic Red Team, phi3-mini, NVD,
malwarebazaar
Supervisor Name:
Ms. Sadia Saad
Group Members:
Abdul Sarni Qasim (22i-1725)
Ahmad Abdullah (22i-1609)
Muhammad Ta Iha Bin Oba id (22i-1577)
FAST NUCES ISLAMABAD CAMPUS

AuditX
AuditX is a network device auditing platform which parses device configurations (HPE Aruba AOS-
S, Cisco IOS/I0S-XE), builds a vendor-agnostic model, and evaluates YAML-based audit rules to
report compliance findings. It integrates with Batfish for multi-device network analysis and
topology visualization, and leverages RAG-based Al to provide natural language querying and
intelligent remediation guidance.
Features include:
TextFSM-based configuration parsing into a vendor-agnostic model
VAML-driven audit rule evaluation with pass/fail/N/A results per check
Al-driven risk prioritization and severity scoring
Intelligent false-positive reduction using contextual validation
Multi-device network topology analysis via Batfish integration
Audit report generation with compliance framework mapping
Key Words: Configuration Auditing, Compliance Automation, Vendor-Agnostic Configuration, Network
Topology Analysis, Retrieval-Augmented Generation (RAG)
M
AuditX
TD MJt0Nt• natworll conftgu1ation auditing and CMS)lianu ac:rcss .-Jlti•vitndor
Technology Used:
Python, Batfish, YAML-based rule framework,
JSON normalization models, SQLite, Docker,
React, RAG
Supervisor Name:
Dr. Muhammad Asim
Group Members:
Muhammad Jalil Ahmad (i22-1635)
Abdul Moeez Siddiqui (i22-1637)
fU'l-"'MI JaUl .UW..d i22·1615
1 I . . M N . I 11 N t i h a.i H i 1 1 S 2 id 2 d - i ~ qu l i !22-lil7 Umar Niazi {i22-1551)
Supervisor: Ox. Huhariftad
FAST NUCES ISLAMABAD CAMPUS

Intel Ii SecDashboard
lntelliSecDashboard is an Al-powered intelligent security and analytics dashboard designed to
simplify data monitoring, analysis, and decision-making for both technical and non-technical users.
The system focuses on real-time data processing, anomaly detection, natural language interaction,
and secure system monitoring through a unified web-based platform.
The application provides an interactive dashboard where users can query data using natural
language, automatically generate SQL queries, visualize data in real time and receive intelligent
insights without requiring technical expertise. lntelliSecDashboard integrates structured databases
and real-time streaming data sources to deliver live monitoring and analytics.
The system is designed with strong cybersecurity principles, including authentication, role-based
access control, encryption and audit logging to ensure data integrity, privacy, and secure access.
If the system fails to correctly interpret a query or detect an anomaly, the admin can update
configurations, datasets, and system rules to improve system intelligence. The system continuously
improves through updated models, logs, and admin feedback.
Features Include:
• Natural Language Querying (Text-to-SOL & SOL-to-Text)
• Real-time data integration from databases and streaming APls
• Automated data visualization (charts, graphs, maps, heatmaps)
• Machine-learning based real-time anomaly detection
• Intelligent alerts and notifications system
• Secure authentication, authorization and role-based access control
• Encryption, audit logging and cybersecurity monitoring
• Real-time system monitoring and analytics dashboard
Key Words:
Al Dashboard, Cybersecurity Analytics, Anomaly Detection, Natural Language Processing, RealTime
Monitoring
I ntellisecdash
Your Query, our security
To develop a dynamic, secure, and intelligent dashboard that transforms SQL
queries into human-readable text and provides ms1ghtful data v1suaozat10n using
Python libraries and Large Language Models (LLMs).
,_ lr,fOfflllllian
Data V....aiDlion
Technology Used:
Python, Flask, MySQL, Machine Learning
(Isolation Forest), LLMs (Google Gemini API),
Web APls, HTML/CSS/JavaScript, REST APls,
Encryption Algorithms, SQL, Cloud Integration
Supervisor Name:
, ~ Dr. Noshina Tariq
.
~.O.UR..cril-al Co-Supervisor Name:
__ If ~
Mr. Sohaib Khan
.. Group Members:
Manahil Chaudhry (22i-1728)
,
•• Noreen Mazhar (21i-2768)
Abia Javed (21i-0311)
FAST NUCES ISLAMABAD CAMPUS

VIGILON
Vigilon is an Al-powered smart home surveillance system developed to enhance residential security
through intelligent monitoring and real-time threat detection. The system utilizes Artificial
Intelligence and Computer Vision techniques to analyze live video streams, detect camera
tampering, weapons detection, and identify suspicious activities within a home environment. Unlike
traditional CCTV systems that only record footage, Vigilon actively processes visual data to generate instant
alerts and actionable security insights.
The system consists of a single User View designed specifically for homeowners. Through a user-
friendly interface, users can access live camera feeds, review logs and screenshots, and receive real-
time notifications in case of intrusion, tampering, blackouts, or weapons.
Features of Vigilon -Al Smart Home Surveillance System
• Al-Based Weapons Detection: Detects weapons using intelligent algorithms.
• Real-Time Alerts & Notifications: Sends instant alerts to the user in case of tampering or
intrusion.
• Recorded Footage Access: Logs and Screenshots saved can be viewed
• Direct Contact with Authorized Security Personnel: Enables the user to immediately
contact security authorities during emergencies.
Key Words: Artificial Intelligence (Al), Computer Vision, Smart Home Security, Real-Time Monitoring,
Intrusion Detection System
Technology Used:
Supervisor
MS. C N o ah & l W \O l O )e I N '" I r S a O ri r q . YOLOv8, Flutter, Figma, Python (Flask)
ML Uubbra "-m•
PostgreSQL
~ i 20752un•lr•Ahrn.d
22t-1e57 zan1sh Khan
22i-1~6 ~alaan Azb Supervisor Name:
VIGILON
Ms. Mahnoor Tariq
An Al-powe1ed mubile a.pp fo, ,~al-lime t10,ne ::.ur veillance with
instant threat detection and remote monitoring controL Group Members:
Zunaira Ahmed (22i-2075)
Zarlish Khan {22i-1657)
Faizan Aziz (22i-1946)
¥ (ll~vaSOL P
YOLOvB ~ Lask Flutter
FAST NUCES ISLAMABAD CAMPUS

JUNO
JUNO is an Al-powered communication hub specifically designed for Shopify-based dropshipping
businesses. The platform addresses the fragmented and slow communication cycles that occur
between customers, vendors (store owners), and suppliers. By integrating directly with Shopify and
supplier workflows, JUNO automates repetitive tasks while maintaining human oversight for high-
risk cases.
It features a dual-sided Al system that automates customer support by detecting intent and
sentiment while simultaneously translating vendor instructions into structured supplier requests
via JUNOCHAT. The platform centralizes multi-channel messages into a unified inbox enriched with
real-time Shopify data to prioritize high-risk cases like fraud or legal threats. Automated workflows
handle routine tasks such as tracking updates and address changes, ensuring end-to-end
synchronization across the supply chain. For complex scenarios, the system maintains "human-in-
the-loop" safety by queuing sensitive issues for manual review. New vendors can quickly integrate
their stores through a guided four-step onboarding wizard that automates API connections and data
syncing.
Keywords: (Al-Powered Communication, Shopify Integration, Dropshipping Automation, Sentiment
& Intent Detection, Unified Multi-Channel lnbox)
Technology Used:
React, Shopify API, LLMs, Google API,
AES-Encryption, CronJobs, Gmail, Pub/Sub API
Supervisor Name:
Mr. Arslan Aslam
Group Members:
Muhammad Usman (i22 - 1689)
Syed Saad Mohsin (i22 - 1601)
Talat Faheem (i22 -1735)
FAST NUCES ISLAMABAD CAMPUS

Fathom
Fathom is an automated malware analysis framework that integrates static analysis, dynamic
sandbox execution, and large language model (LLM)-based interpretation to assist cybersecurity
investigations. The rapid growth of malware samples makes manual analysis slow and resource-
intensive, highlighting the need for automated analysis systems.
The framework analyzes suspicious files using both static and dynamic techniques to identify
malicious indicators and behaviors. Static analysis inspects file structures using methods such as PE
parsing, entropy analysis, string extraction, and YARA rule matching, while dynamic analysis
executes files in an isolated sandbox environment to observe runtime activities including process
creation, registry changes, file system modifications, and network communication.
Key capabilities include:
• Automated ingestion and processing of suspicious files
• Static malware analysis for structural indicators
• Dynamic sandbox execution for behavioral monitoring
• Extraction of malware indicators and artifacts
• LLM-based summarization of technical analysis results
Technology Used:
Python, CAPEv2/Cuckoo Sandbox, YARA,
Oletools, FastAPI, MERN Stack (MongoDB,
Express, React, Node.js), Mixtral-8x7B LLM,
Supervisor Name:
Dr. Sana Aurangzeb
Group Members:
Muhammad Haseeb (221-1698)
Abdul Hadi (221-1646)
Muhammad Ammar (221-1626)
FAST NUCES ISLAMABAD CAMPUS

Dfendrix - Network Defense Powered by Agentic Al
Dfendrix is a network defense platform designed with both technical and non-technical users in
mind, including SOC trainees, IT admins, academic researchers, and SME managers. The system
operates through multiple modules-Al-Enhanced Network Monitoring, Agentic Al Classifier, Multi-
Agentic Intrusion Detection System, Attack Response & Mitigation, Attacker Tracing & Visualization,
and a Threat Case Dashboard - to provide real-time monitoring, threat detection, automated
mitigation, attacker analysis, and centralized visualization. Users can review alerts, add mitigations,
and track incidents, while the Explainable Al layer ensures transparent decision-making. The
platform combines traditional IDS/IPS tools (Zeek & Suricata) with Al agents to deliver lightweight,
scalable, and accessible network defense.
Features include:
• Real-time traffic monitoring and log capture with Zeek and Suricata
• Al-based threat classification and anomaly detection
• Automated and manual attack mitigation workflows
• Attacker tracing, gee-visualization, and incident analysis
• Centralized web-based dashboard with dynamic updates and reports
• Explainable Al providing reasoning behind detection decisions
Technology Used:
Zeek, Suricata, PostgreSQL/MySQL, Visual
Studio, ELK, React, Python, XGBoost, CNN,
SHAP/LIME
Supervisor Name:
Ms. Sadia Saad
Group Members:
Ayesha Areej (i22 -1711)
Sabreena Azhar (i22 -1751)
Javeriah Faheem (i22 -7421)
FAST NUCES ISLAMABAD CAMPUS

Oculus: Employee Cyber Hygiene Monitoring System
The Oculus app is being made whilst keeping the perspective of organizations and employees. There are
two views of this app; Employee View and Ad min View, the former is for employees to monitor their cyber
hygiene score, receive real-time feedback on password practices, login activity, web usage behavior, and
phishing response behavior, and interact with an Al-based assistant for personalized security guidance.
The latter is for the admin, who can analyze organizational cyber hygiene trends, identify high-risk
behaviors, monitor phishing susceptibility, and evaluate overall security posture through dashboards and
analytics. Oculus uses Al-driven scoring models to quantify cyber hygiene and help organizations
proactively manage human-centric cybersecurity risks.
Features include:
• Al-based cyber hygiene scoring using behavioral analytics
• Password and login monitoring with breach and MFA analysis
• Web activity risk detection through browser extension
• Phishing simulation module to simulate phishing emails, evaluate employee responses, and analyze
email content to detect potential phishing attempts
• Gamified dashboard with achievements and leaderboards
• Organizational analytics and risk insights for admins
• RAG-based cybersecurity assistant for guidance and education
Key Words: Cyber Hygiene, Behavioral Analytics, Al Security Monitoring, Phishing Simulation, Gamification,
RAG Chatbot
Technolo Used:
Python (FastAPI, Scikit-learn, SBERT, RAG),
JavaScript (React.js, Chrome Extension APls),
PostgreSQL, Google Adm in SDK & Reports API,
Google Safe Browsing API, OAuth 2.0, JWT,
Docker, Git/GitHub
Supervisor Name:
Ms. Sadia Saad
Group Members:
Laiba Waseem (22i-1566)
Zainab (22i-1557)
,,_ python· @
Muhammad Hassan (22i-1770)
FAST NUCES ISLAMABAD CAMPUS

ScamShield - Phishing URL Detection Plugin
ScamShield is a browser-based phishing URL detection plugin developed to protect users from
malicious websites using a hybrid multi-layered detection approach. The plugin first performs
blacklist verification to instantly block previously identified phishing URLs. If the URL is not present
in the blacklist, it proceeds to a heuristic-based analysis layer where structural and lexical features
such as presence of excessive subdomains, suspicious special characters, URL length, entropy, and
HTTPS usage are evaluated. URLs that remain uncertain are then passed to a trained Machine
Learning model for final classification as legitimate or phishing. Feature extraction and
normalization are applied before ML prediction to ensure accurate results. By integrating blacklist
filtering, heuristic analysis, and machine learning, ScamShield enhances detection accuracy,
reduces false positives, and provides real-time protection directly within the user's browser.
Features include:
Blacklist-based filtering of known phishing URLs
• Heuristic analysis of suspicious URL patterns
• Feature extraction and preprocessing
• Machine Learning-based classification
• Real-time URL testing and prediction
Key Words: Phishing Detection, Blacklisting, Heuristic Analysis, Machine Learning, Cybersecurity
Real-Time Phishing Detection
The Growing Problem
$ Phishing uuuck::1 incrcusing every ycur
Pake ·wcbsilcs look identical lo r-c-al onc5
E> Users cunnol cusily identify scum linki;
b
Our Solution: ScamShield
0 Comprehen.sivc. multi-layered detection engine Technology Used:
0 Sflfc preview mode for secure brow$ing
0 MinimaJ Latency "ith client-side intcfcrcncc Python, Scikit-learn, Pandas and Numpy,
Joblib, Google Colab
How It Works
Supervisor Name:
Visit Cra"'ler Blacklist Threat Maam Sana Aurangzeb
Website Extracu Heuristic & Classification
I
Group Members:
Maria Maqsood (i22 - 1651)
Rozina Wali (i22 -1779)
Muhammad Ibrahim (i22 - 1686)
FAST NUCES ISLAMABAD CAMPUS

ScanShield
ScanShield is an automated cybersecurity tool designed to perform pre-deployment security
compliance checks on IT devices before they are connected to an organizational network. In many
organizations, devices such as desktops and laptops are deployed without proper security
validation, exposing networks to risks such as outdated firmware, weak configurations, malware,
and unauthorized software. ScanShield automates device detection, security auditing, and
compliance verification, reducing the need for manual inspection by IT administrators while
ensuring devices meet required security standards.
Features include:
• Automated device detection and system inventory collection for connected devices
• BIOS, firmware, and hardware configuration validation for security compliance
• Port and interface monitoring for USB, external devices, and other hardware interfaces
• Software integrity checks and vulnerability assessment using CVE/NVD databases
• Generation of detailed security reports with remediation recommendations
• Web dashboard for scan control, monitoring, and management
• Al-powered chatbot for querying scan results and obtaining security insights
Technology Used:
Python, React.js, Flask/FastAPI, Microsoft
Defender APls, LangChain, FAISS, REST APls
Supervisor Name:
Ms. Hina Binte Haq
Group Members:
22i-1659 Muneeb Kashif
22i-1702 Abdul Samad
FAST NUCES ISLAMABAD CAMPUS

Al PenTap
Al Pen Tap is an Al-powered and integrated USB penetration tester that aims to facilitate more
complicated cybersecurity tests among students and cybersecurity specialists. It is a device that is
connected to hardware modules of Wi-Fi, RFID, and Sub-GHz testing on one, portable platform
with offline, Al-controlled chatbot functionality.
Features include:
• Multi-Protocol Testing: Integrated modules for Wi-Fi (handshake capture/deauth),
Dual-frequency RFID (13.56MHz/12SkHz), and Sub-GHz signal analysis.
• Al-Powered Guidance: Real-time interpretation of raw technical results into
understandable terms and educational security insights.
• Automated Reporting: Generation of encrypted, exportable security reports detailing
findings and fixes.
• Offline Functionality: Operates without an internet connection to ensure security and
reliability in isolated testing environments.
• Ethical Safeguards: Built-in limits and logging to ensure the device is used only in
authorized, legal testing conditions.
Key Words: (Cybersecurity, Artificial Intelligence, Penetration Testing, Wireless Security, Raspberry Pi 5)
Technology Used:
Python (Chatterbot, Scapy, Aircrack-ng),
Raspberry Pi OS, CC1101 (Sub-GHz), MFRCS22
RFID
Su ervisor Name:
Mr. Mehmood ul Hassan
Grou Members:
Haad Zia (i22 -1643)
Huzaifa Khalid (i22 -1760)
Syed Osaed Jafar (i 22 -1776 )
ATION 1ES1.I
FAST NUCES ISLAMABAD CAMPUS

Bluseal
Bluseal is an Al-powered security analysis tool that detects vulnerabilities in software during the
early stages of development. It analyzes natural language requirement documents using standards
like NIST, ISO, OWASP, CAPEC, and CWE to identify specification-level security flaws. For Level 1
Data Flow Diagrams (DFDs), it performs design-level threat analysis and generates detailed reports
using STRIDE, LINDDUN, and PASTA frameworks. Bluseal provides actionable recommendations,
enabling developers, security analysts, and researchers to adopt a secure-by-design approach,
reduce dependency on specialized security experts, lower remediation costs, and prevent
vulnerabilities before implementation.
Key Features:
• Automated analysis of natural language requirement documents to detect security flaws
• Intelligent security assessment of Data Flow Diagrams (DFDs) for design-level vulnerabilities
• Generation of actionable, standards-based mitigation recommendations (NIST, OWASP,
ISO)
• Multi-framework threat modeling using STRIDE, LINDDUN, and PASTA
• Structured reporting with detailed risk levels, threat categories, and mitigation steps
Key Words: (Add 5 Key words i.e technologies/themes reflecting your study)
Q
Supervisor:
IBLUSEAL Ms. Saadia Saad
Team Members:
Al-Secured Bluef;!rints Laaibah Qayyum 221-1604
for a Safer SDLC Ali lmran 221-1568
Abscracc
BLUSEAL is an Al tool that identifies security risks in requirements and
DFDs before coding begins. enabling a secure-by-design SDLC and
helping teams build secure software faster with greater confidence.
r ~- ~ - ~ - j l
I
User Input Data AJ Model Security Report
Technology Used:
' P,.processlng
Hugging Face, Visual Code, Python, ViT, RAG
Supervisor Name:
Ms. Saadia Saad
OPD i1$ lnpvt Tra V ns is f i o o r n m er (S F T la R w ID D E e , t P ec A t S io T n A , S•curity Report Group Members:
andUNDOUN)
Ali lmran (22i-1568)
0,
Analyze requirements for security gaps.
~J Laaibah Qayyum (22i-1604)
Evaluate OFOs for potential threats.
:-= Genorate actlonablo security reports
T(M,ls;md 0 >(I
Tcchnolo~ics v
t:scd:
FAST NUCES ISLAMABAD CAMPUS

Accenra
Accenra is an Al-powered Identity and Access Management (1AM) system designed to automate
user lifecycle management and enhance enterprise security through intelligent access control and
administrative automation. When a new employee is selected by the HR department, their
information is first registered in the HR system and automatically synchronized with the 1AM
platform. Using this data, the system performs automated user onboarding and later supports
secure offboarding by assigning roles, departments, and access rights based on organizational
policies defined by HR inputs. Newly created users can securely access a self-service portal to
request additional permissions and manage account-related services. The system implements
token-based authentication combined with Multi-Factor Authentication (MFA) to ensure secure
session management, protected resource access and integration with multiple enterprise
applications. Accenra also incorporates comprehensive logging and auditing mechanisms to track
user activities and maintain accountability. Administrators are supported through an Al-driven
Admin Copilot, which operates on 1AM policies to answer administrative queries and execute
authorized management tasks using natural language interaction.
Key Words: (Identity and Access Management, Role-Based Access Control, Al Automation, Multi-Factor
Authentication, Token-Based Authentication, Admin Copilot)
| ~ Accenra                                                                                                           |                           |     |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------- | --- |
|                                                                                                                     | 1111:1149--- -            |     |
| ---- WWW•B·                                                                                                         |                           |     |
| To,,..omx.,.,_ s«.Ufe ldent~J.id actte$S ma...-,1m1                                                                 | U.d<tllen aamr,..1rattve  |     |
| ullMantt,tt1.11111ftJrf'fle~l"ll ll.&lt•lluedwerp,c~lsJ~1,s tn1. ..a utllN't!Cllll~1111d  eentl"llll9d-Mtcinlf,)(.  |                           |     |
Technology Used:
+,¥11,1
@®®§  Python, Freel PA, ReactJS, FastAPI, AD, NLP,
Keycloak, MySQL, OpenlD, 0 Auth
| 1l  12  | 13  1•  |     |
| ------- | ------- | --- |
Supervisor Name:
Dr. Qaisar Shafi
Group Members:
o
Aleena Fatima Qureshi (22i-2353)
| [§J ~FreelPA | ~   |     |
| ------------ | --- | --- |
+  Daniyal Babar Bilal (22i-0766)
| IIA,tveD,re<tory  | . rnongoOB  @React  |     |
| ----------------- | ------------------- | --- |
Lubna Basha rat Abbasi (22i-1699)

FAST NUCES ISLAMABAD CAMPUS

Twin Guard
Objective TwinGuard aims to provide secure tunneled remote access and robust user
authentication by leveraging a Zero Tn1st Network Access (ZTNA) framework. The
system focuses on synchronizing physical IoT devices with high-fidelity 3D digital
twins, delivering real-time telemetry and immersive visuahzation through a
centraJized, secure user dashboard.
Project Description TwinGuard is a cyber-resilient solution designed to bridge the
gap between physical IoT environments and advanced digital monitoring. By
implementing a Zero Trust architecture, the system operates on principle of ''never
trust, always verify,'' ensuring that every access request is fully authenticated,
authorized and encrypted through secure tunneling before granting entry to network.
Features:
• Secure Remote Access - Users can safely access their private IoT infrastructure from
anywhere without exposing internal ports to the public internet.
• Real-time Monitoring - Live telemetry updates such as sensor data and device status are
displayed on a secure dashboard.
• 3D Digital Twin Interface- Users interact with a dynamic 3D representation of their physical
environment for better visualization and control.
• Enhanced Security Architecture - Reduces traditional perimeter and flat-network
vulnerabilities while ensuring end-to-end data integrity and proactive threat mitigation.
e
Supervisor
Dr. Mu"'M"""d """'
,iii,. ...s F,;,r•oq ,:C,o,I
Twin Guard U Ah m &• i ~ wZ k d ,, , < 22 h 1 1 - 1 1 ,lf 7 0 :2 0 2 1.1s1s
H.,1,,...in 10,•q•n 221•1(;81
Twir1Gu:nd pro•1ide.s secure remote access and user authent cation vi;i 7TNA It
!.ynchrooizcs. loT device~ to Celiver real·time teh:-1111:!lr }' dr 1u 30 'lhudllzatlon via
dashboard.
-- ARCHITECURE --
Technology Used:
ZTNA, Secure Tunneling, Unity, C#, Arduino,
MongoDB, Python, Flask, and Firebase
Supervisor Name:
Dr.Muhammad Asim
Mr.Shams Farooa (Co)
-- TIMELINE --
Group Members:
Stp·0:1
Umar Zeb (122-1700)
1 a G . . ~ L"' : : ~ '. ~ .:. ~ '.4 , -r Abubakar Sharif {122-1575)
Hussain Khaqan {122-1681)
--TOOLS & TECHNOLOGIES --
FAST NUCES ISLAMABAD CAMPUS

CDR Email Gateway
We are building an enterprise grade Email Gateway that focuses on Zero Trust security and
proactive threat prevention. The system consists of two main parts which are the Core CDR Engine
and the Adm in Dashboard. The core engine takes care of deep file parsing, hybrid threat detection
using YARA and Convolutional Neural Networks, and safely reconstructing standard business
documents like PDFs and Word files. The dashboard is designed for security administrators to
monitor threats in real time and review file data. Whenever an attachment contains a hidden threat
like a dangerous macro or script, the system surgically removes the active content and delivers a
completely safe and fully functional file to the user.
Features include:
• Performing deep forensics and breaking down incoming email attachments
• Detecting threats through a hybrid approach that combines static YARA rules with a custom
neural network
• Removing active content to safely eliminate hidden malware and zero-day threats
• Reconstructing files securely while keeping the original visual layout and format intact
• Providing a real time admin dashboard for monitoring threats and connecting with
enterprise email systems
Key Words:
Content Disarm and Reconstruction, Zero Trust Architecture, Hybrid Threat Detection, Deep File
Parsing, Cybersecurity
Technology Used:
Python, Yara, TensorFlow, Keras, Django Rest
Framework
Supervisor Name:
Dr. Sana Aurangzeb
Group Members:
Zohaib Mattloob (22i-1707)
Anoosha Khalid (22i-1758)
Moarij Ali (22i-1595)
FAST NUCES ISLAMABAD CAMPUS

Web Watch Hound
WebWatchHound (WWH) is an OSINT-Based Digital Risk Protection (DRP) System being developed
to help organizations monitor, detect, and analyse digital threats across the surface, deep, and dark
web. The system is designed from the perspective of enterprises, cybersecurity teams, government
institutions, financial organizations, and researchers who require an affordable, locally deployable,
and privacy-focused solution for monitoring data leaks and threat actor activities. Existing DRP
solutions are mostly expensive cloud-based Saas platforms with foreign dependencies, which may
raise privacy and sovereignty concerns. Therefore, this project focuses on building a standalone Al-
powered platform that automates threat intelligence collection and analysis while ensuring local
deployment capability.
The system continuously collects data from multiple sources such as paste sites, code repositories,
forums, chat rooms, social media platforms, and dark web marketplaces. It automatically detects
compromised credentials, exposed sensitive information, and potential threat actor activities.
Using Al and NLP techniques, the platform analyses and enriches collected data, reduces false
positives, and generates prioritized, actionable alerts. Each alert includes contextual metadata such
as source, timestamp, severity, and confidence level. The system also provides an intelligent
dashboard for monitoring, triage, and investigation, along with API integration for Security
Operations Canters (SOCs) and external systems.
•
Web Watch Hound (WWH)
..
Comprehensive Digital Threat Monitoring
..
- "" -..-_:_' ·_ ,-_·~ ,: ---_ .
-
Web Watchhound
'""""
• -@
f
-+ --+
Al Engine
Technology Used:
React, TailwindCSS, FastAPI, Python,
...®
,
OCR Jh1k Anlfyln PostgreSQL, Scrapy, Playwright, Tor,
LangChain, LLMs (Groq), Docker
Supervisor Name:
Core Tech Stack
II II o ,. Mr. Mehmood UI Hassan
Group Members:
0 • 0l ~
Muhammad Shaayan (i22 -1664)
Abdullah Nadeem (i22 -1759)
Muhammad Musaab (i22 -1560)
FAST NUCES ISLAMABAD CAMPUS

FORTIS
FORTIS is a unified, automated SecOps orchestration platform designed to enhance the efficiency
of Security Operations Centers (SOCs) through intelligent automation and Al-driven
decision-making. It integrates a comprehensive suite of open-source security tools including
Wazuh for host monitoring, Suricata or Zeek for network intrusion detection, OpenCTI and
VirusTotal for threat intelligence, and TheHive with Cortex for case management and automated
analysis into a single orchestrated dashboard. By leveraging Large Language Models (LLMs), the
system autonomously analyzes security alerts and enriched threat data to generate
incident-specific response playbooks and executable mitigation scripts, such as blocking malicious
IPs or isolating compromised hosts via a dedicated FORTIS Agent. This multi-layered architecture
combining data collection, integration, Al-driven orchestration, and visualization aims to minimize
manual analyst workload, reduce human error, and significantly accelerate mean time to detection
(MTTD) and response (MTTR).
Features Include:
Unified Orchestration Dashboard, Automated Data Collection, Real-time Threat Enrichment,
Intelligent Case Management, LLM-Driven Playbook Generation, Easy Script Execution, Risk-Based
Prioritization.
•
FORTIS
Automated SccOp-:; OrchcJtr;:ition
Dashboard
OBJECTIVE & GOALS
• One platform for detection & response.
• LLM-driven automated workflows.
• Rapid, manual-free incident resolution.
• Robust open-source architecture.
MOTIVATION
• rragmented security slows response.
• High overhead for small teams.
• Need for open-source SOAR
DESIGrN Technology Used:
Orchestration & Remediatio;;1 Wazuh, OpenCTI, Suricata, VirusTotal, The Hive,
.":"" ··-I
. -···•.ei<1>1 Cortex, Lang Chain, React, Elastic logstash,
~ oo
Python, Node Js
r Su ervisor Name:
Dr. Muhammad Asim
Group Members:
Muhammad Usman(22I-0900)
Abdullah Saqib (221-1666)
Saad Mudassir (221-1674)
FAST NUCES ISLAMABAD CAMPUS

NetSage Al
NetSageAI is a behavioral network visibility and anomaly detection platform built on Zeek and Arkime,
keeping in view the needs of enterprise SOC teams and security engineers. The system passively monitors
internal traffic via SPAN/TAP ports, generates structured Zeek logs and full packet captures, and builds
communication baselines for each device and user. There are two main views - SOC Analyst View and
Security Engineer/A dm in View - the former is used to investigate alerts, search sessions, visualize network
topology, and drill down from high-level anomalies to packet-level evidence, while the latter is used to
configure policies, tune baselines, manage models, and adjust retention settings. When an analyst believes
a detection is noisy or unclear, they can provide feedback through the dashboard; the admin can then
refine rules or ML thresholds, with the system updating future alerts accordingly and attaching brief LLM-
generated explanations to help teams quickly understand why an event was flagged.
Features include:
- Passive monitoring of internal network traffic and automatic asset discovery from Zeek logs and PCAPs.
-Creation of behavioral baselines per device/user and detection of deviations such as traffic volume spikes,
new destinations, and unusual protocols.
- Identification of key attack behaviors including policy violations, SSH brute-force attempts, suspected
data exfiltration, and C2-style beaconing patterns.
- Dual-indexed storage in OpenSearch for fast global search and per-asset history, with full-packet forensic
retrieval via Arkime.
-Web-based dashboards for real-time monitoring, topology visualization, alert management, and
generation of executive and technical security reports.
Technology Used:
NetSageAI Zeek, Arkime, Filebeat, Logstash
BehaYk>ral Networtc Vltibility A AnonulW Detection OpenSearch & OpenSearch Dashboards
N0t5¥AI is a pilS$lva llltlwork l'fmlONlljf ?latforrn lhal t:llJY.lnJlil trafk; Viii
SPAN!TAP. AAAtyz~ it •ith Zeek and M imt:I, hukls h&h9'11Mtl ba~Jl8$ pet' dfMee.
and detecls anomeilies S4.ICh as lateral ff'IO\'ement, brute-lorce, delA exf*etior\ ard
C2 canmuni-cation, all presefifld lhrugh dashboerck and reports br sec enaJysts Docker, Bash scripting
-~ ·-
- r~llllNftkO.f.t. · ,,,¥ - ._W.,..N.. % ,;:- ---.. ' - =- Python (ML), LSTM Autoencoder, CICFlowMeter
---.:z...--.-..
• ,.,...,._...w~•
Supervisor Name:
- - - --- - - = - - - - !, - / -- --·
• ~--- Dr. Zafar Iqbal
i.:. --
~-,..,---~
__,..,.U.enct-«
··-= -
- -
- Group Members:
- = £ ...... - ~ .. . ~ , " . ' • -g - = - -
- ..a := -
Saif ur Rehman (221-1697)
·······-i.···-·········----i.·-·················r.·····------···r.···
Abdul Muhaiman (221-1694)
.-. --
Umer Farooq (221-0518)
=Gnu~pMo:m.tn- =
s.u. ... --.. "'-~
FAST NUCES ISLAMABAD CAMPUS

MalStrike
We developed MalStrike, a Chrome extension designed to provide real-time website security while
browsing. Unlike traditional antivirus tools, it operates directly in the browser and gives users clear
visibility and control over potential threats.
MalStrike monitors network traffic and uses an XGBoost-based machine learning model to classify
malicious activity. To improve accuracy, we added three additional detection layers: behavioral
analysis  of scripts,  signature  matching  against  known  threats,  and  rule-based  detection for
suspicious behavior. This multi-layered approach significantly strengthens threat detection.
The extension features a real-time dashboard displaying CPU, memory, network, and disk activity.
When a threat is detected, users can view detailed information and choose to close the tab, ignore
the alert, or whitelist the domain. An optional auto-close feature enables automated responses.
MalStrike is lightweight and efficient. All data processing remains local, ensuring complete client-
side privacy and strong performance.
Key Words: (Machine Learning, Cybersecurity, Browser Extension, Behavioral Analysis, Real-Time
Threat Detection)
Q
MALSTRIKE
|     | Rt."ill Tm-.c Web ThrcJt OetcctlOfl & Mor11tormg ~ |     |     | tern  |     |     |     |
| --- | -------------------------------------------------- | --- | --- | ----- | --- | --- | --- |
Al Jv,,,o1.."d&~~lofPto«l'-..;:dctl.'tllo'l
ARCHITECTURE
4--4.AvtR DtTtcTION SY'SUM
TIMEUNE
|     |     |     |     |     | ..: ~=-·  |     | Technology Used:  |
| --- | --- | --- | --- | --- | --------- | --- | ----------------- |
o.a.~.-
&MtHooo8P.d.1MC.......-e
•~wunSrrw  -~~proctc1,gS.C1')ll  Python, JavaScript, HTMLS, CSS3, JSON,
-1),,e:;l~, .,,_~
~--~
Node.js, Chrome Extension API
| KEY FEATURES  |     |     | TECHNOlOGIES  |     |     |     |     |
| ------------- | --- | --- | ------------- | --- | --- | --- | --- |
.,.~r.. .. n.-io.,..,,....,  · ~t™i•l  (Manifest V3) Service Workers .
eH"M.s&cm
4-L.a)'tiAJCtan.lo:don
eo.r-&i:i:ensoon,IJII
| Matie.1 T.lb '-'1t11a,t,rlffl  |     |     | •xa~:m.KMoc:!11           |     |     |     |                   |
| ------------------------------ | --- | --- | ------------------------- | --- | --- | --- | ----------------- |
| JJttulo.Cmotllllthnn.tldds     |     |     | ea-,                      |     |     |     |                   |
| Si'lttmf.t1::o1JKtMcrr.orin~   |     |     | eHr.&.-.-'Pft:-           |     |     |     |                   |
| ., -.:rnO.i,t,o,,d             |     |     | .· .G.•.•....ti.A.c uons  |     |     |     |                   |
| :;lll1:A.lilfll:Th1n.S~.7!     |     |     | es.MC1Wclbr:1             |     |     |     | Supervisor Name:  |
.,.lqx,,ll.OIJl.~!M
| Wlhlr.lribnai,WMIII  |     |     | . lfdt):td3S:o.-1a1  |     |     |     |     |
| -------------------- | --- | --- | -------------------- | --- | --- | --- | --- |
Mr. Jawad Hassan Nisar
PERFORMANCE METRICS
| 0     | 0       | @         | 6   |                         | .,,,  |     | Group Members:  |
| ----- | ------- | --------- | --- | ----------------------- | ----- | --- | --------------- |
| -95%  | <200ms  | <20% CPU  |     | ,5..0..-..1.,0,,0uM~B   | >80%  |     |                 |
<S%
o.-tKtJanAcw~ry  ~r- ~-..-?«1  ll>,1eo..-9  Shahzaib Khan (i22 -7436)
DETECTION LAYERS
| f-- |     |     |     |     | f--- |     |     |
| --- | --- | --- | --- | --- | ---- | --- | --- |
u y ,t f  I  M t .M O O Q  U J ' ! f l . l l l H A Y _ IO_A A  L  i .. , . ,   3..  S, t. G,N .A _tU I  U   ~ '- I M . E-B M W   Abdullah Bin Umar (i22 - 1690)
|                                       | ~~ ,S . o_ ., ,.    | ,  !. .O.   | f _ ,           |       |                     |                          |     |
| ------------------------------------- | ------------------- | ----------- | --------------- | ----- | ------------------- | ------------------------ | --- |
|                                       | -                   | i - m g     | d r             | - - - | ~~ . . ..-, w , g   |                          |     |
| r O -.Ni,r,acc,n:;r  D I M C M :n n   |                     |             | J S   w a , q   |       | ~Ci.1:otnr-.M1      |                          |     |
|                                       | ~f.t1:iura~1t:itm1  |             | "ildo<.J • ~-   |       |                     | Sara Guizar (i22 -2764)  |     |

FAST NUCES ISLAMABAD CAMPUS

| Aegis - | Enterprise Threat Detection & Security Advisory  |     |     |
| ------- | ------------------------------------------------ | --- | --- |
Aegis is made as a threat detector and security advisor for Small and Medium Enterprise. Its major
modules include an Al based Intrusion Detection System, a Pentest module and an advisory chatbot.
The IDS continuously monitors network traffic to detect malicious activities such as DDoS attacks,
port scans, and DNS exfiltration using Al-driven and signature-based detection mechanisms. When
a suspicious activity is detected, the Pentesting Module performs validation by scanning affected
assets for open  ports,  exposed services, and  known vulnerabilities (CVEs),  ensuring alerts are
context-aware  and  risk-prioritized.  The  Chatbot  Advisor then  provides  clear,  natural-language
explanations of threats, vulnerability severity, and recommended mitigation steps. These modules
work together to form a closed loop; it continuously refines alert severity and response decisions by
feeding validated exposure and vulnerability intelligence back into the detection and correlation
engine. Aegis is designed to be cost-effective, explainable, and extensible, allowing future integration
of advanced threat intelligence or automated defensive policies.
Features include:
Al-driven network intrusion detection system (CNN-LSTM + XGBoost models)
Pentest validation using Nmap scanning
Vulnerability intelligence integration (CISA KEV, NVD CVE data)
Context-aware alert correlation and risk escalation
Natural-language Al advisory with remediation guidance
Key Words: Intrusion Detection System, Vulnerability Intelligence, Closed-Loop Security, Pentest
Scanning, Risk Correlation
Suporvisor
or. s.ana Aurangzetl
G.-ovp Mombor•
Area. Zeb-22 -1561
Soh•r Iqbal M•lik -221·8803
|             | Muh.,rr,miid Ahmad "41.JsUti'a  | 22 -1sg1  |     |
| ----------- | ------------------------------- | --------- | --- |
| ENTERPRISE  | THREAT                          |           |     |
| DETECTION   | &  SECURITY                     |           |     |
ADVISORY SYSTEM
Whoro Al Moots Cybor Dofons•
| THE SMI                     | CLOSED-LOOP         |                             |     |
| --------------------------- | ------------------- | --------------------------- | --- |
| SECURITY OAP                |                     | DU'INSI                     |     |
| .. .. . .  4. .3.1 .. .o.l. |  .. .               |                             |     |
| .•   ~ SM b l -             | •  A  U             | " 'i fM d  i c , - y a t-•  |     |
| - - . . . . . -             | - - M)              | 'b< 1 d M l e tt • e l.     |     |
| trltNf)O,....ldet-          | ffHotlon lflQ;!ef1  |                             |     |
• .,..,..,,.,. .. p.. ..• •tl"ff  Ofld fil-.O'•• Mllltt
1..c.l.rw..c: .t-•.,..itti
| -,-w.-,y  | ~   | noltlgatl. ..  |     |
| --------- | --- | -------------- | --- |
Technology Used:
,,_..,.,  I
.=;-,
Python, FastAPI, Docker, React, JavaScript,
| . .   l   |     |     |     |
| --------- | --- | --- | --- |
H)ob,odN- .4 .  :
i  Nmap, Ubuntu WSL, Visual Studio Code, CNN-
| ..o i. ....,   !   lt-.t. ... J  |     |     |     |
| -------------------------------- | --- | --- | --- |
f'lpelne
| r ~-.c,or-,&  |     | LSTM Hybrid Model, Scikit-learn, SHAP/ LIME,  |     |
| ------------- | --- | --------------------------------------------- | --- |
l
moi~,Ofl
_j  XGBoost Classifier, Retrieval-Augmented
u- -.-,
| = 1·                                   |     |     | Generation (RAG).  |
| -------------------------------------- | --- | --- | ------------------ |
| ..,,_,  l'~I                           |     |     |                    |
| Med,,!.  -- cOo.,c,.1,9.1_' ..-i,o,,_  |     |     | Supervisor Name:   |
°&".S"y"t"•"-"-
Dr. Sana Aurangzeb
TECHHOLOO-Y STACK
| .t,I & 81:CUtl'fY  |     | FAOH-TIN0  | Group Members:  |
| ------------------ | --- | ---------- | --------------- |
IACKSND
| J.A3ndom  |     |     | Areej Zeb (22i-1561)  |
| --------- | --- | --- | --------------------- |
'lforests
| 0   | . dock..- | @Re  |     |
| --- | --------- | ---- | --- |
PyTorch
MongoDB  Muhammad Ahmed Mustafa (22i-1591)
| MITRE  ATT&CK'  | lxpress  | n • cl~®  |     |
| --------------- | -------- | --------- | --- |
XGBoost
Sahar Iqbal (22i-8803)

FAST NUCES ISLAMABAD CAMPUS

Sentinal360
Project Brief/ Overview
Sentina1160 is a cyhersecmity platform that integrates Digital Risk Protection (DRPS) and External Attack Surface
Management (EASM) to detect and mitigate online threats targeting organizational assets. The system collects inputs
such as domains, IPs, URLs, and brand names, then performs asset discovery and enumeration to identify external
infrastructure including subdomains and cloud assets.
Discovered  assets  are  analyzed  through  multiple  security  detect.ion  module~,  including  DNS  analysi5,  brand
comparison, visual similarity detection, and vulnerability scanning. Sentinal360 also integrates threat intelligence feeds
to enrich findings and provide deeper 1isk context.
A risk seorinJ!; enJ!;ine evaluates threats based on severity and impact, generating Di!!;ital Risk Protection (DRP) reports
and real-time insights through an interactive security dashboard. By automating discovery, analysis, and 1isk evaluation,
Sentinal360 enables faster detection of phishing attacks, domain impersonation, and external security exposures.
Features Include
• Phishing & brand impersonation detection
• DNS analysis & reputation checks
• Visual similarity detection for fake sites
• Vulnerability scanning of assets
• Threat intelligence enrichment
• Real-time security dashboard
User (Organitation)
Organiution securiiy teem
| 01 adtninlstratOf".  | --  |     |     |     |     |
| -------------------- | --- | --- | --- | --- | --- |
r
Asset Input
Domain. IP, URL. Bfancl Name.
|     | List of input types.  |     |     | Technolo  | Used:  |
| --- | --------------------- | --- | --- | --------- | ------ |
Asset Discovery &
Enumeration (EASM)
| lden1ifylng 11UC1< s.rleee.  |     |     |     |     | Python 3.12  |
| ---------------------------- | --- | --- | --- | --- | ------------ |
·SUbdOmans
-Elclo<nal IP,
| ·CloudAsMKS  |                    |     | Flask (REST API Backend)                    |     |     |
| ------------ | ------------------ | --- | ------------------------------------------- | --- | --- |
| r            | External Scanning  |     |                                             |     |     |
|              | Engine             |     | MERN Stack (MongoDB, Express.js, React.js,  |     |     |
Kubemctes worker nodes
|     | tX O C \l lin Q   s c a n | n i n ~   1 0 0 1 $ .    |     |     |           |
| --- | ------------------------- | ------------------------ | --- | --- | --------- |
|     | S c a l a *  c c . a n  a | r c h i t e c t u r e .  |     |     | Node.js)  |
Detection Modules
| (Parallel Analysisl  |     |     | Docker (Containerization)  |     |     |
| -------------------- | --- | --- | -------------------------- | --- | --- |
Kubernetes (Scalable container orchestration)
•=--
| '  ..___,_ ,  |     | '\  | Google Search Engine/ OSINT APls (Threat  |     |     |
| ------------- | --- | --- | ----------------------------------------- | --- | --- |
Threat Intelligence
|     | & Data Enrichment  |     |     |     | discovery)  |
| --- | ------------------ | --- | --- | --- | ----------- |
concextualtlinQ llnOings wun
globol feeds and databases.
• Enhanced risk context.
Su
| Risk Scoring &  |     |     |     | ervisor Name:  |     |
| --------------- | --- | --- | --- | -------------- | --- |
Correlation Engine
| Analyzing Impact, colcLlatlng  |     |     |     | Dr.Muhammad Asim  |     |
| ------------------------------ | --- | --- | --- | ----------------- | --- |
risfic SCOre$.
• C-orneclbg tnrtat Clata.
|     |     |     |     | Grou  | !Vlem hers:  |
| --- | --- | --- | --- | ----- | ------------ |
DRP Security Report
| r  ..  |     |     |     |     |     |
| ------ | --- | --- | --- | --- | --- |
-~-•-_=__ _roe_.  c,o._ .ml ·e-md@fioN_db•_tiO-M·,_  and_
|     |     | . ,  |     | Syed Fassih {22i-1730)  |     |
| --- | --- | ---- | --- | ----------------------- | --- |
executiv. s!Jf'l'lfflrry.
• Actionlble Insights.
Ahmed Umar (22i-1580)
Security Dashboard
&An;ilytics
| Real-time visualiz:alion of  |     |     | Ahmed Shahzad (22i-1578)  |     |     |
| ---------------------------- | --- | --- | ------------------------- | --- | --- |
dlgttal rlslc.
• Seo..irhy t1end1 and mettles.

FAST NUCES ISLAMABAD CAMPUS

Sentinal - Al-Powered Multi-Camera Vehicle Re-Identification &
Surveillance System
Sentinal is an intelligent, Al-driven vehicle surveillance platform designed to overcome the critical
limitations of Automatic License Plate Recognition (ALPR)-only systems. Traditional ALPR solutions
fail when plates are obscured, damaged, forged, or unreadable due to environmental conditions,
creating serious gaps in security and law-enforcement operations.
Sentinal introduces a hybrid architecture combining two pipelines:
Real-Time Re-Identification Pipeline: Processes live RTSP/HTTP video feeds from IP cameras. YOLO
detects vehicles frame-by-frame, and a RelD backbone extracts discriminative embeddings enabling
cross-camera tracking without reliance on license plates.
Forensic Search Pipeline: Operates on stored recordings for post-event investigation. A Vision-
Language Model extracts semantic vehicle attributes (color, make, body type), enabling natural-
language queries such as 'show red SUVs near Gate A in the last 2 hours'.
In-Memory Data Engine: Redis serves as the communication backbone, caching embeddings and
metadata, managing inter-service messaging and supporting Vector Similarity Search for low-
latency cross-camera retrieval.
Two role-aware web dashboards provide real-time monitoring with detection overlays and alerts,
and forensic analysis with ranked search results and clip export.:
The system is containerized with Docker and GPU-accelerated for scalable, real-world deployment.
Key Words: Vehicle Re-Identification, Vision-Language Model, YOLO, Redis Vector Similarity Search,
Real-Time Surveillance
Technology Used:
Al/ ML: YOLOv8, FastRelD, Qwen 2.5 VLM,
ONNX Runtime, PyTorch
Backend: Python, Flask REST API, Redis (VSS,
Pub/Sub, AOF)
Frontend: React.js, Tailwind CSS, WebSockets
Infrastructure: Docker, NVIDIA GPU (RTX 30+),
RTSP/FFmpeg
Libraries: OpenCV, ByteTrack, scikit-learn,
NumPy
Supervisor Name:
Dr. Mateen Yaqoob
Co-Supervisor Name:
Usama lmtiaz
Group Members:
Syed Abdul Rasheed (221-0486)
Saamer Abbas (221-0468)
M. Jawad Khan (221-0507)
FAST NUCES ISLAMABAD CAMPUS

SOCentriq (Agentic Al SOC)
SOCentriq is an innovative, Al-augmented Security Operations Center (SOC) platform designed to mitigate
the "Alert Tax" and analyst burnout by transitioning from static rule-based detection to autonomous
reasoning. Built on a modular 4-layer architecture (Intelligence, Ingestion, Analytics, and Governance), the
system leverages a technical stack featuring Wazuh for SIEM, Logstash for ETL, and MISP for threat
intelligence integration. The core intelligence engine utilizes a locally-deployed, fine-tuned Llama 3.1 (8B)
model that achieves 75.3% reasoning accuracy, rivaling models 9x its size while remaining 7.9x more cost-
effective. By integrating a Neo4j knowledge graph for multi-hop campaign correlation and a Milvus vector
database-which provides a 14.lx latency advantage (2.4ms) over traditional search-SOCentriq identifies
complex attack chains like phishing-to-credential-theft in real-time. The platform successfully targets a >=
30% reduction in false positives and improves the Mean Time to Detection (MTTD) to under 5 minutes,
providing a statistically verifiable and scalable autonomous defense framework aligned with the Pakistan
National Al Policy 2025.
Key Features
• Autonomous Intel Extraction: LLM-based parsing of unstructured threat reports into STIX
2.1 JSON bundles pushed directly to MISP.
• Context-Aware Anomaly Scoring: Quantified risk calculation incorporating VIP status, asset
criticality, and gee-anomalies ($Score= \min(lO0, Base+ VIP+ Intel+ Asset+ Geo)$).
• Graph-Based Campaign Correlation: Utilizing Neo4j to map user-asset-threat relationships
to detect lateral movement patterns thousands of times faster than traditional SQL JOINs.
• Semantic Memory: A Milvus vector database storing security event embeddings for high-
speed anomaly pattern matching.
• Explainable Al (XAI): "Chain-of-Thought" reasoning traces that provide human analysts with
auditable, step-by-step logic for every automated alert.
Key Words Agentic Al, Knowledge Graph, Vector Database, SOC Automation, LLM Reasoning.
Technology Used:
Llama 3.1 (8B), Wazuh, Logstash, MISP,
Ollama, Neo4j, Milvus, PostgreSQL,
OpenSea rch, React.js
Supervisor Name:
Dr. Zafar Iqbal
Group Members:
Hadia lmran (22-1710)
Ayila Rasheed (22i-7430}
Abdur Rehman (22i-7433}
FAST NUCES ISLAMABAD CAMPUS

AegisNet: Encrypted Traffic Analysis
AegisNet is a next-generation, cloud-based security system engineered to detect Advanced
Persistent Threats (APTs) and malicious activities within encrypted traffic, entirely bypassing the
privacy risks and massive computational overhead of SSL/TLS decryption proxies. Deploying
lightweight endpoint agents, the system feeds network flows into a sophisticated, multi-tiered Al
architecture trained on custom sandbox datasets. It first establishes a localized behavioral baseline
via unsupervised learning to minimize false alarms. The core engine then utilizes JA4 network
fingerprinting and flow statistics for real-time threat monitoring. Suspicious traffic triggers a
secondary deep learning layer that analyzes initial packet sequences to classify attack vectors, map
them to MITRE ATT&CK TTPs, and attribute them to specific APT groups. Finally, AegisNet
proactively neutralizes threats by automatically isolating compromised users via Active Directory.
Features include:
• Privacy-preserving threat detection without the latency of SSL/TLS interception proxies.
• Real-time JA4 network fingerprinting combined with CICFlowMeter and DoHlyzer statistics.
• Multi-layered Al pipeline for granular attack classification and MITRE TTP mapping.
• Unsupervised learning for behavioral baselining to drastically reduce false positives.
Technology Used:
Python,Pytorch,TensorFlow,Docker,Linux,AWS
Supervisor Name:
Dr. Muhammad Asim
Grou Members:
Abdul Hadi (i22 - 1693)
Malik Ameer Hamza (i22 -1570)
Saad Umar (i22 - 1736)
FAST NUCES ISLAMABAD CAMPUS

Zero Trace - Al-Driven Cybersecurity Game
Zero Trace is an Al-driven cybersecurity awareness and phishing simulation game developed from
the perspective of real-world cyber threat scenarios. The system provides an interactive 3D
environment where users engage in simulated phishing attacks, social engineering attempts, and
security decision-making challenges. The players can navigate realistic scenarios, analyze emails,
URLs, attachments, and system behaviors, and make decisions that affect outcomes and scoring.
The system provides contextual Al-generated feedback based on real-world Indicators of
Compromise (loCs). If a user struggles with a scenario, adaptive difficulty mechanism adjusts future
challenges accordingly. The admin can monitor performance of players, review decision logs, and
update threat intelligence datasets to reflect emerging cyber threats.
Features include:
- Interactive 3D phishing and cyber attack simulation scenarios
- Al-powered contextual feedback using real-world loCs
- Reinforcement learning-based difficulty scaling
- Procedural content generation for replayability
- Performance tracking and behavior analytics dashboard
Key Words: Gamification, Phishing Simulation, Cyber Hygiene, Reinforcement Learning, Retrieval-
Augmented Generation (RAG)
Technology Used:
Unity (C#), Blender, Python, FastAPI, RAG
Pipeline, Machine Learning Techniques, Visual
Studio Code
Supervisor Name:
Ms. Sadia Saad
Group Members:
Duaa Aamir (i22 - 1753)
Eman Zafar Raja (i22 -1567)
Aayesha Saud Khan (i22 - 1589)
FAST NUCES ISLAMABAD CAMPUS

SmartBehaviour - Al Driven Malware Sand boxing and Adaptive DFIR
An Al-driven malware sandboxing and adaptive DFIR system is being developed to improve organizational
cybersecurity by automatically detecting, analyzing, and responding to malicious files. The system works by
monitoring endpoint files and safely sending suspicious files such as PDF, DOCX, XLSX, ZIP, and EXE into a
sandbox environment for secure execution and behavior analysis. It has two main perspectives: Endpoint
Monitoring Side .:ind An.:ilyst D.:ishboard Side. The former is responsible for detecting incoming files on
employee systems and forwarding them to the sandbox without executing them locally, while the latter is
for security analysts to review Al predictions, confidence scores, behavioral evidence, and incident response
actions. The system uses anomaly detection Al to identify unusual behavior and classification Al to classify
malware into families such as Ransomware, Worm, Virus, Spyware, and Adware. If the threat is confirmed,
the system can trigger automated response actions such as isolating the endpoint, deleting malicious files,
and blocking harmful IPs or domains. Analysts can also provide feedback through the dashboard, allowing
the system to continuously improve its accuracy over time.
Features include:
• Real-time endpoint file monitoring for PDF, DOCX, XLSX, ZIP, and EXE files
• Secure malware execution and behavior capture using Cape Sandbox
• Al-based anomaly detection for identifying suspicious file behavior
• Mal ware family classification using machine learning models
• Analyst dashboard showing verdicts, evidence, confidence scores, and timelines
• Automated incident response including endpoint isolation, file deletion, and IP/domain blocking
• Continuous feedback and learning to improve Al performance over time
Key Words: Malware Analysis, Sandbox, DFIR, Anomaly & Classification Detection, Incident Response
SMARTBEHAVIOR
Al Driven M elware Sandboxlng and Adaptive DFIR
Technology Used:
Reactjs, Flask, Python, Docker, Cape Sandbox,
Ansible
H aman.llehavlour
A-=--=--
O: b;;d.---=""=::...=-=·:'------'..._-<. Supervisor Name:
~-•--f9"~"t Dr. Qaisar Shafi
to.A.1..Wt,. ....
0 Group Members:
Komal Zahra (i22 - 1613)
Wania Sajid (i22 - 1691)
WHAT W E O FFER
Seam••- ndpolnt l=lle Survellh,nc.e
Hamna Alam (i22 - 1650)
,O 1ao1at.ed SandbO.x & Dynamic Bet'lavtoral
ln~elllgen~ Anomaly D•~•ctlon
<1!J> Al
-
---~
FAST NUCES ISLAMABAD CAMPUS

TriEdge
Al-Powered Adaptive Alert Triage & Contextual Response Engine (TriEdge) is developed to enhance
SOC operations by automating alert triage, prioritization, and response recommendations. It provides
an Analyst View for real-time incident analysis with ML-based severity prediction, LLM-generated
summaries, MITRE ATT&CK mapping, and feedback submission, along with a Management View for
performance and alert trend monitoring. The system integrates with Wazuh and enriches alerts using
threat intelligence feeds (Vulners, OpenCTI, CISA KEV). It combines rule-based noise reduction,
graph-based correlation, and ML models for intelligent prioritization.
Features include:
• Automated alert ingestion and noise reduction
• Incident correlation and severity prediction
• LLM-based incident summarization • Threat intelligence enrichment
• SOC dashboard with feedback loop
• Automated response recommendations
Key Words: SOC Automation, Machine Learning, LLM, Threat Intelligence, Incident Response
OUR SOLUTION
Al-Or vCr'l I lybr-id SOC Autorn.)t.lon Cnglno th.Jt:
• PrP-filrprc. ratc;;p no-;1nve'S
- Correllltcs ate ns nto 1nctdents
• Predic::ts: s:averlty using ML
• Generates LLM-baseo surnm.ar1es
- PtUVH.h:~ or HJ l~kt.::. ,::1(,.l,.ICJII 1 ~(,.C,Hlllll-.!'IU;Jdlll(.,)11~
ARCHITECTURE KEV FEATURES Technology Used:
DAT A SOURCES • Gr.aph~b•~u~d C:arrAladon:
Links related Dlcrt.s into u Python (FastAPI), NodeJS, PostgreSQL,
~•ngle lnclc:Jent vsins
r~letlio,1:!>t1lp tnHpplna:::,. Neo4j,scikit-learn/XGBoost, and
• Dynamic Risk scorlna:
Adjui.<l$ .aler'"l p,.lorhy boil-~ed
on i'SS4't vah.. 1e, exploit SecurityLLM/LLaMA 3.1.
.av;;;ul.ablt,cy, and lhro..r.
PROCESSING coni:~xt.
• Thre.-1: In~•• Fusion: Supervisor Name:
Enrl<;h~~ alcrrs \/Vith P.xternal
thr-o.-.t incolligonco from
Vulncrs, OpenCTI, and CISA
KEV. Dr. Muhammad Asim
• Ana1ys1. fi'eedtHIIICk Loop:
Lo.iirns: tr-om .:.ni.lllys1.
ORCHESTRATION decisions t.o conllnuou~ly
imprO\le ML pr-@dictlons. Group Members:
• Automation HoOk.'!ii:
Trlccers ~utomated
n:!Sponse act:ions lhrough
APls ,.-net SOAR inl@cre1tions. Ta Iha Aamir (i22 -1572)
TECHNOLOGIES USED
.- G FastAPI - Q, Adeen llyas (i22 - 1573)
FAST NUCES ISLAMABAD CAMPUS

MALeficent
MALeficent is an Al-driven multi-modal framework developed to unify malware detection and
payload-aware steganalysis. While traditional methods often struggle with obfuscated threats,
this system bridges the gap between simple detection and actionable threat intelligence.
The frontend of this application consists of three primary modules: Malware Classification,
Steganalysis, and the Dataset Gallery. The first allows users to upload malware binaries, which
the system converts into RGB images, or directly upload images to classify them into specific
malware families. The second provides a deep analysis of images to detect hidden steganographic
content, identifying both the payload type and its potential maliciousness. The third serves as an
informational hub for the custom GAN-based synthetic datasets created to train these models.
Features include:
• Malware Classification and Conversion: Converts malware binaries into RGB images to
capture structural patterns for classification.
• Payload-Aware Steganalysis: Detects hidden content in images and identifies whether the
embedded payload is text or another image.
• Malicious Payload Assessment: Analyzes extracted payloads to determine if they are
benign or malicious.
• GAN-Based Dataset Generation: Addresses data scarcity through synthetic text-in-image
and image-in-image steganography samples.
Key Words
1. Deep Steganographic Detection
2. Embedded Payload Classification
3. Binary-to-Image Malware Representation
4. Steganography Payload Classification
5. GAN-Driven Security Dataset Engineering
MALeficent
HI N
Technology Used:
Python, Flask, TensorFlow, Generative
Adversarial Networks (GANs), CNNs
Supervisor Name:
- -- - Ms. Sadia Saad
""'°"
-., Group Members:
.._,.IOI ....
Hoorya Muhammad (i22 - 1644)
TECH ja Hurmain Fatima (i22 - 7438)
STACK
H...m..in F~:. . .., 22i-7438 Supervuor: Ms. :,odia Saad
Hooryo Muhommod 22i-1 f>.4A
FAST NUCES ISLAMABAD CAMPUS

SafeCharge - Securing EV Charging Protocols
SafeCharge: Analysis and Defense of EV Charging Protocols
The SafeCharge project is a comprehensive research and development study focused on the
cybersecurity of the Open Charge Point Protocol (OCPP), specifically targeting its latest iteration,
version 2.1. The project builds upon the established EmuOCPP framework to conduct empirical,
emulation-based security assessments that evaluate how well newer protocol standards mitigate
known vulnerabilities. By transitioning from a theoretical analysis of precursor versions (1.6 and
2.0.1) to an active experimental phase involving the implementation of the OCPP 2.1 specification,
the study identifies residual risks and develops actionable defense strategies for the global EV
charging ecosystem.
Features include:
Multi-Version Protocol Analysis: Systematic comparison of security mechanisms across OCPP
versions 2.0.1, and 2.1 to track the evolution of protocol resilience.
Enhanced EmuOCPP Framework: Extension of the base emulation environment to support the
structural and behavioral modifications introduced in OCPP 2.1, such as improved certificate
management and updated authorization flows.
Adversarial Attack Simulation: Replication and verification of novel attack vectors, including Man-
in-the-Middle (MitM), Security Profile Downgrading, and Charge Station Impersonation (11/12).
Mitigation Strategy Formulation: Development of evidence-backed security guidelines and
hardening recommendations for vendors and network operators.
Key Words:
OCPP 2.1
Network Emulation
Man-in-the-Middle
Cybersecurity Testing Framework
Protocol Analysis
Technology Used:
OCPP, Python, SQLite, Wireshark, YAML
Supervisor Name:
Problem Statement
Dr. Zafar Iqbal
• Rapid Growth of EV Charging Infrastructure
Group Members:
• Increasing Complexity of Charging Networtcs ~la~~~,11:!
·VulnorablUUes In Central Management Systems (CSMSI Jibran Hanan (i22-1732)
• Risk or Input Manipulation & Cvber Alt.ac:k.s
Kumail Haider (i22 -1723)
• Need for Roat-time Monitoring & Anomaly Detocl1on
• Adnan Khaliq (i22 - 2529)
1. Emulator with OCPP 2.:1. Protocol
2.Att.ack Simulation
3.Testlng Mitigation Strategies
4.Research & Training
Results ·
DoS
FAST NUCES ISLAMABAD CAMPUS

TYPHON
TYPHON is a controlled, research-oriented framework designed to study modern malware evasion
techniques without generating harmful binaries. The system accepts C++ source code and
automatically transforms it into obfuscated and evasive code while preserving functionality,
simulating techniques commonly used by advanced persistent threats (APTs) to bypass traditional
antivirus (AV) and endpoint detection and response (EDR) systems.
It integrates five core modules: code parsing, selectable obfuscation (e.g., variable encryption,
garbage code insertion, control-flow flattening), runtime evasion techniques (e.g., API unhooking,
metamorphism, sandbox detection), a Tree2Tree VAE-based machine learning model that
intelligently selects optimal transformation strategies, and a user-friendly GUI for managing the
process. The tool outputs only transformed source code, ensuring ethical and safe experimentation.
TYPHON bridges theoretical malware research and practical cybersecurity training, enabling Red
Teams, Blue Teams, and academic researchers to analyse and understand real-world evasion
strategies inspired by sophisticated threat actors in a responsible environment.
Group M•ff'm•.-. : Supervlaor :
Muh&>rnrnud (ol.Pi-16.lll) Mr. J,g....,gd l-•hHllCU~.-.
Zut 1uil.J Al" 111:1Ll Mww, (eei-17US)
ze,b Un N11se (221-17S5}
Technology Used:
C/C++, Python, VS Code, Machine Learning,
Code Analysis, GitHub
Supervisor Name:
Mr. Jawad Hassan Nisar
Group Members:
Muhammad Daiyyan (i22 - 1624)
Zohaib Ahmad Meer (i22 -1745)
Zaib Un Nisa (i22 -1756)
FAST NUCES ISLAMABAD CAMPUS

Blupher 1.0
Blupher 1.0 is a defense-grade secure communication system that uses embedded hardware and
open-source software to provide hardware-isolated, real-time encrypted voice communication. It
ensures privacy and security against advanced threats like spyware by handling all encryption and
decryption exclusively on Raspberry Pi-based smart headsets, ensuring plaintext audio is never
exposed to host devices.
Features include:
• Complete hardware-isolated audio pipeline utilizing ALSA, WebRTC Audio Processing
Module (APM), Opus encode/decode, and XChaCha20 encryption/decryption.
• Real-time voice transmission over Bluetooth Low Energy (BLE).
• Cross-platform host relay application (for Windows, Linux, macOS) that forwards encrypted
packets without accessing them.
• Secure key exchange using X25519 Elliptic Curve Diffie-Hellman (ECDH).
• Short Authentication String (SAS) verification to prevent man-in-the-middle (MITM)
attacks.
Key Words: Secure Communication, Bluetooth Low Energy (BLE), XChaCha20 Encryption, Embedded
Hardware, Audio Signal Processing.
Technology Used:
Raspberry Pi 4 Model B, C++, Python, ALSA,
WebRTC APM, Opus Codec, Libsodium (for
XChaCha20-Poly1305), BlueZ / 0-Bus, Bleak
library.
Supervisor Name:
Mr. Mehmood UI Hassan
Group Members:
Asad Khurshid (22i-1585)
Muhammad Azan Afzal (22i-1741)
Ehtisham UI Hassan (22i-1777)
FAST NUCES ISLAMABAD CAMPUS

Nexa Aegis: Al-driven Forensics System to detect and analyze Child
Sexual Abuse Material (CSAM)
An integrated Al-powered digital forensics platform is being developed to assist law enforcement
and investigation agencies in detecting and analyzing Child Sexual Abuse Material (CSAM). The
system combines artificial intelligence with digital forensic techniques to automate the
identification of suspicious content and support faster investigations.
The platform analyzes digital images and videos using Al models for explicit content detection and
age estimation. It also extracts and examines metadata to help build a more complete criminal
profile. An investigator dashboard is provided to manage cases, review flagged content, assess risk
scores, and monitor analysis results in an organized and efficient manner.
Features include:
-Al-based CSAM detection
-Age estimation of individuals in digital content
-Metadata extraction and criminal profile building
-Risk scoring and content classification
-Investigator dashboard for case management and review
Key Words: Artificial Intelligence, Digital Forensics, CSAM Detection, Age Estimation, Criminal Profiling
Technology Used:
Python, TensorFlow, Pytorch, ADB, MongoDB,
OpenCV
Su ervisor Name:
Dr. Qaiser Shafi
Group Members:
Maryam Amjad (i22 - 1924)
Amna Nadeem (i22 - 1593)
Dur-e-shahwar (i22 - 1579)
FAST NUCES ISLAMABAD CAMPUS

RootHunter: Agentic Al-Based Digital Forensics Platform
RootHunter is an intelligent DFIR framework and end-to-end pipeline that automates the ingestion
and filtering of high-value security alerts, accelerates case creation with full investigative context,
and orchestrates targeted endpoint evidence collection while preserving evidence integrity. It then
leverages agentic Al to analyze artifacts, detect evidence gaps, request additional allowlisted
artifacts when needed, correlate findings across sources, and generate a structured, cited forensics
report with clear timelines and confidence-backed conclusions. RootHunter includes the following
features:
• Unified End-to-End DFIR Platform: Provides complete digital forensics workflow.
• Context-Rich Case Creation: Automatically builds investigation-ready cases by extracting
and attaching key observables and metadata.
• Targeted Evidence Collection: Orchestrates host-side artifact collection based on the
incident type to capture relevant forensic data.
• Agentic Al Investigation Loop: Autonomously analyzes evidence, detects gaps, requests
additional allowlisted artifacts, and re-analyzes for higher confidence.
• Cited Forensics Report Generation: Produces a structured forensic report with evidence-
backed claims and traceable citations.
Key Words: Digital Forensics, Incident Response, Agentic Al, Security Operations Centre, Threat Hunting.
UU'flSOO TUMr ,cnsars
Ol"~lNWl,lSl'l "~I.MJ.OUrllJUJtoQ,(211-lUll TAU11,J.SGII-Ul(221 lWtUtllllUlut, t.U (W-TMI
ROOTHUNTER
AGEHTIC Al-BASED DIGITAL FORENSICS PLAIFORl1
f'H!iiih1#
To automate high-value a'ert tnogc, accelerato contoxt-nch caso
creation, orchestrate targeted endpoint evid~ collectt0n, ~d use
ageotic Al to Jr\)lyze artif.:icts, correlate evidence-, .:ind generate a cited
forenso report
Technology Used:
Wazuh, TheHive, OpenCTI, VirusTotal,
W-i'hH! IPiif il,ii ttfl:ij'fl Uft hlllllfKt lcolsr.JNI Velociraptor, Python, React, CrewAI, SQLite
Supervisor Name:
Dr. Muhammad Asim
Tl tt?l'Wtllii 81MMI
Group Members:
Muhammad Umer Farooq (22i - 1661)
W ,;\ Hive X Ope~ L] CPew r Talha Asghar (22i -1554)
* r.l .i: -:
Malik Uzzam Arif (22i -1748)
FAST NUCES ISLAMABAD CAMPUS

ShopSense
SHOPSENSE, is an NLP-based intelligent search engine designed for multiple e-commerce stores in
Pakistan. The system allows users to search for products using natural language instead of
traditional keyword-based search. Users can describe what they need in simple English (e.g.,
"good performance phone with strong battery"), and the system understands the intent behind
the query using Natural Language Processing (NLP)
SHOPSENSE analyzes the user's intent (such as economical best, performance best, or feature-
based requirements) and searches across multiple online stores that have been scraped and
indexed in our database. The system then compares products and provides the most relevant and
optimized results based on the query context.
In addition to text-based search, SHOPSENSE supports:
• Image-based search, where users can upload a product picture along with a query to find
similar or matching products.
• Voice-based search, allowing users to speak their query naturally.
The goal of SHOPSENSE is to improve the online shopping experience in Pakistan by making
product search smarter, faster, and more user-friendly through Al-driven understanding.
Keywords: NLP, Machine Learning, E-commerce Aggregation, Web Scraping, Multimodal Search.
Technology Used:
React Native, Node.js, MongoDB, PyTorch,
Python
Supervisor Name:
Mr. Arsalan Aslam
Group Members:
Hasham Hassan (i22-1617)
Abdul Nafay (i22-1605)
Fakhir Ali (i22-0762)
FAST NUCES ISLAMABAD CAMPUS

Al-Driven Adaptive Honeypot and DFIR Automation
Al-Driven Adaptive Honeypot and DFIR Automation is an open-source cyber security platform that
integrates adaptive honeypot deception with AI/ML/DL-driven attack classification and automated
Digital Forensics processes. It deploys containerized Cowrie and Dionaea honeypots and an
adaptive orchestration layer is implemented that dynamically changes OS banners and services to
prevent fingerprinting. Data is normalized by Zeek into structured logs and PCAPs and analyzed
using machine learning and deep learning models to detect attack types while learning attacker
TTPs in real-time. Indicators of compromise are enriched using MISP, AbuselPDB, and Open CTI, with
telemetry indexed in Elasticsearch and visualized through Kibana and Grafana dashboards.
Features include:
- Containerized Cowrie (SSH) and Dionaea (malware capture) deployment
- Adaptive honeypot orchestration with dynamic OS and service simulation
- AL/ML/DL-based attack detection and classification.
- Threat Intelligence enrichment using MISP, AbuselPDB, and OpenCTI.
-Automated DFIR timeline reconstruction and forensic artifact collection.
- Real-time monitoring using Elasticsearch, Kibana, and Grafana.
Key Words: Adaptive Honeypot, DFIR Automation, Threat Intelligence, Machine Learning, Deception
Technology.
Technology Used:
Cowrie, Dionaea, Zeek, Python, Elasticsearch,
Kibana, Grafana, MISP, OpenCTI
Supervisor Name:
Dr. Zafar Iqbal
Group Members:
Attiya Basha rat (i22 -1629)
Anoosha Rehman (i22 -1715)
FAST NUCES ISLAMABAD CAMPUS

|     | tradlA- | Al-Powered Cryptocurrency Trading Assistant  |     |     |
| --- | ------- | -------------------------------------------- | --- | --- |
An Al-powered crypto trading system is being developed to assist retail traders in volatile markets.
The platform provides a unified Trader View through which traders can monitor real-time market
data, receive buy/sell signals generated using ICT (Inner Circle Trader) and Smart Money Concepts
methodologies,  and  execute  trades  manually or  through  automated  execution.  Traders  can
configure parameters such as risk level, stop-loss, take-profit, and exposure limits, run backtests to
evaluate strategy performance before enabling live trading, and track live Pnl and performance
metrics. The system includes built-in risk controls to protect against abnormal market conditions.
Features Include:
•  Al-based detection of trading structures (FVGs, liquidity zones, order blocks)
•  Multi-timeframe feature engineering
•  Real-time signal generation (Buy/Sell) with confidence scores
•  Backtesting engine with performance metrics (Win Rate, Drawdown, Profit Factor)
•  Automated trade execution through exchange APls
•  Position sizing and integrated risk management
•  Real-time dashboard for visualization and analytics
Key Words: Artificial Intelligence, Machine Learning, Algorithmic Trading Systems, Financial Time-Series
Modeling, ICT / Smart Money Concepts, Automated Risk Management
From Market Data to Automated Trades: An Al System for Intelligent Crypto
Signal Generation.
| -L-..,-  | - Architecture  |     |     |     |
| -------- | --------------- | --- | --- | --- |
_
| 11~~  | ill1'  | @)     | 111111m  |     |
| ----- | ------ | ------ | -------- | --- |
|       |        | .....  | I-I-  ~  |     |
.__
| 0 o. -... .. ....     |          | M < - . . , _               | • r. o .r x -.- |     |
| --------------------- | -------- | --------------------------- | --------------- | --- |
| . . ..  -             | 0 ..-~~  | · · - - - - ..  .. . .. ..  |                 |     |
| b   I A • ~   ttr-11  | -        | •- t .bd l l f~             |                 |     |
.o, w , ._ , .
|     | .....  |     | -~Al'lfr-- |     |
| --- | ------ | --- | ---------- | --- |
.,._
|      |     | . .•    | .             |                   |
| ---- | --- | ------- | ------------- | ----------------- |
| s--- |     | l!!ll-- |               |                   |
|      |     |         | ~ ltldtOMMMM  | Technology Used:  |
•Timel•ine
Python, FastAPI, Scikit-learn, Pandas, Next.js,
,
|     |     | . '  | .  .;   | Typescript, TailwindCSS  |
| --- | --- | ---- | ------- | ------------------------ |
...
|     |     | .           | . .  |                   |
| --- | --- | ----------- | ---- | ----------------- |
|     |     | . ., . ..   |      | Supervisor Name:  |
"  '
Mr. Shoaib Saleem Khattak
| Sep- Oct  | Oct- Dec  | Jan -Feb  | March -April  |     |
| --------- | --------- | --------- | ------------- | --- |
Group Members:
Tools
Tehreem Zafar (i22 -1630)
| Team                       |     |     | Supervisor:              |     |
| -------------------------- | --- | --- | ------------------------ | --- |
| 7)fi1'.1l"'hr'-'f>M7cifrH  |     |     | M, Stl..dLSdlee1 ~tata~  |     |
Umar Murtaza (i22 -7431)
;;r,. ~1 Jrnc11 Murta?"I
"/1 t54/ :-i-to('U lat ,,hall
Saadullah Khan (i22 - 1647)

FAST NUCES ISLAMABAD CAMPUS

Warden box
Wardenbox is an open source, Al-driven Intrusion Detection System (IDS) with an integrated SemilPS
module, primarily designed to secure web applications running in Docker containerized
environments. Operating on a log-centric approach, Wardenbox collects and parses logs from
running containers, normalizes them into structured JSON, and indexes them in Elasticsearch for
real-time Al-based analysis.
The system's Al Detection Engine uses machine learning to analyze structured logs in real time,
identifying malicious activity across 10 attack types spanning 5 OWASP Top 10 2021 categories. Upon
detection, the Semi-lPS module automatically blocks malicious IPs or applies rate limiting, while
OSINT threat intelligence feeds further enrich detection accuracy.
A unified web dashboard built with React and Streamlit provides real-time log visualization, severity
based alert management, multitenancy support, and downloadable PDF compliance reports. Alerts
are pushed via Slack webhooks or Gmail SMTP. The system is lightweight, scalable, and requires no
manual rule writing; bridging the gap between enterprise grade security tools and the needs of
modern cloud native environments.
Keywords: Intrusion Detection System, Machine Learning, Docker Security, OWASP, Threat
Intelligence, Log Analysis, Semi-lPS, Elasticsearch.
WARDENBOX
Al-Powered Intrusion Detection System
WardenBox is an Al-driven Intrusion Detection System securing
Docker based web applications through reel time log analysis. It
detects 10 attack types across 5 OWASP Top 10 categories.
Technology Used:
Python, FastAPI, Elasticsearch, Docker, React,
Streamlit, Kibana, Machine Learning Libraries,
• F.ntt"rprisc Security
• Container Monitoring OSINT Threat Feeds, Gmail SMTP
• SMEs & Acudemi u
- • Compliance and Audit Supervisor Name:
_ Mr. Mehmood ul Hassan
.. ...... > S J ; O ;oi - H .C t'l' e l,, c 03 d I. o N n I~ ~ M ll v n 1 l 1 l i J -1 U " ·. " e ~ ll " ,. " ., 1 _ '.
Aknl~Syatem Group Members:
ua.1:1Ita\1:V 11.ras l.11 1665 Bakhtawar llyas (i22 - 1665)
\11111na Shatu·ad :UI 1.'i"il
SUl'Ell\llSOR:
\Ir. \\1d.1mootl u.1 t1a._-.sa1, Yumna Shahzad (i22 - 1571)
FAST NUCES ISLAMABAD CAMPUS

AutoCSPM
AutoCSPM (Automated Cloud Security Posture Management) is a lightweight, integrated security
tool designed for AWS environments. The system addresses the growing threat of cloud
misconfigurations by combining two scanning approaches; a Live AWS Scanner that inspects
runtime resources including S3, 1AM, EC2, RDS and VPC against CIS Benchmark rules, and an laC
Scanner that analyzes Terraform templates before deployment to catch vulnerabilities early. A Risk
Correlation Engine normalizes findings from both scanners, prioritizes them by severity, and maps
them to CIS AWS Foundations Benchmark controls. Results are surfaced through a unified web
dashboard with compliance status, and an automated reporting engine that generates CSV reports
for technical teams and PDF executive summaries for management. Alerts notify teams of critical
findings.
Features include:
Live AWS runtime scanning of S3, 1AM, EC2, VPC, and RDS resources
Pre-deployment laC (Terraform) static analysis for hardcoded secrets and over-privileged policies
CIS AWS Foundations Benchmark compliance validation and audit-ready report generation
Unified risk dashboard with severity classification (Critical, High, Medium, Low) and historical
trends
Automated email alerting system for critical misconfiguration findings
Key Words: Cloud Security Posture Management, AWS Misconfiguration Detection,
Infrastructure-as-Code Security, CIS Benchmark Compliance, DevSecOps
Auto~ CSPM
Automated Cloud Security Posture Management
AutoCSPM is an automated cloud security platform that
detects misconfigurations in live environments and laC. It
ensures continuous compliance and secure cloud posture
through pre-deployment and runtime monitoring.
Workflow
Technology Used:
Python, Flask, Boto3, Terraform, Checkov,
Timeline
Supabase, Docker, Reportlab, GitHub, FastAPI
I I
l1erallon·01 N«Mlon·CM Supervisor Name:
j I
Dr. Subhanullah
Group Members:
Powered by
ldrees Khan (i22 - 1747)
0
r.! checkov
Boto 3 Farrukh Riaz (i22-1669)
G FastAPI @React
Team Members Supervisor
F ld a r r e r e u s k K h h R a io n z • - 22 2 1 2 - 1 1 - 7 1 4 6 7 6 9 Dr. Subhanulloh
FAST NUCES ISLAMABAD CAMPUS

AEGIS LIGHT
Aegis Light is an R&D project focused on developing a lightweight framework for secure communication
between resource-constrained loT devices, particularly those used in modern battlefield environments
such as UAVs. Instead of relying on the traditional and resource-intensive TLS security stack, the system
employs state-of-the-art ciphers and protocols specifically designed for constrained environments.
The framework uses:
-Ascon cipher for encryption (NIST SP 800-232)
- EDHOC protocol for authenticated key exchange (RFC 9528)
-OSCO RE framework to ensure end-to-end secure communication between devices (RFC 8613)
Another key focus of the project is provable security. The SAPIC+ tool is used to formally verify the security
claims of the protocols. Implementation and evaluation are performed using the Cooja simulator running
Contiki OS on each mote. Different network topologies are experimented with to simulate communication
scenarios in a battlefield environment.
Key metrics reported include RAM/ROM footprint, CPU utilization, and handshake latency.
Features include:
-Authenticated Key Establishment: Nodes establish a shared secret using an ephemeral Diffie-Hellman
exchange and verify each other's identities.
- End-to-End Secure Communication: Ensures the confidentiality, integrity, and authenticity of data from
sender to receiver.
- Forward Secrecy: Compromise of a device's signing key or static Diffie-Hellman key does not allow an
attacker to recover past session keys.
Technology Used:
C, Contiki OS, cooja simulator, Tamarin,
AEGIS LIGHT -
Proverif
PROBLEM STAUMENT
-~~~•TOO
,)«ll,I ........... & on:-.-ui Supervisor Name:
PROPOSEO SOLUTION
Mr. Jawad Hassan Nisar
••~ _ H ,c_:ll , t l t ..) ..0...t.. f,tT. 'w mOa-aGa HC' , T mI __C, c .U n AI C IT H fY o f t .M D CW ~
Group Members:
ARCHJTI;C"f\JRAL OIACRAM
Muhammad Abdullah Khan Saadi (i22 -1652)
Muhammad Ali Jauhar (i22 -1705)
Syed Muhammad Fateh Kirmani (i22 -1590)
l<EVllENEFITS
TOOL & TECHNOLOGIES
FAST NUCES ISLAMABAD CAMPUS

Al-Assisted SOAR Framework for Multi-Threat Detection, Triage, and
Automated Response
An Al-powered Security Orchestration, Automation and Response (SOAR) framework is being
developed to address the challenges faced by modern Security Operations Centers (SOCs). The
system integrates machine learning with security automation to enable faster detection of multiple
attack vectors, intelligent triage, and automated response execution with minimal human
intervention. The framework consists of two core modules: the Threat Detection Module, which
employs a Bi-LSTM deep learning model for anomaly detection and pattern matching across SIEM
logs, endpoints, and honeypots; and the Incident Triage and Automated Response Module, which
performs severity scoring and executes predefined playbooks for containment actions such as IP
blocking, file quarantine, and account isolation.
Features include:
• Multi-threat detection (phishing, ransomware, malware)
• Bi-LSTM model for phishing email classification
• Automated incident triage with severity scoring and correlation
• Honeypot (Cowrie) integration to capture novel attack patterns
• Centralized case management in TheHive with MISP threat intelligence enrichment
• Automated file quarantine on Windows endpoints
Key Words: SOAR, SIEM, Machine Learning, Threat Intelligence, Incident Response Automation
Technology Used:
Wazuh, Shuffle, TheHive, Cowrie, MISP,
MailHog, VirusTotal API, Python, Bi-LSTM
Supervisor Name:
Ms. Hina Binte Haq
Group Members:
Muhammad Saad Umar (221-1679)
lmtisal Binte Faisal (221-1660)
FAST NUCES ISLAMABAD CAMPUS

Early Stage Fileless Malware Detection
Spectra is an Al-powered security tool designed to focus on the early-stage detection off ileless
malware. Spectra adopts a proactive detection approach by performing real-time process
monitoring and targeted memory analysis. It observes suspicious behaviors such as process
hollowing, encoded PowerShell commands, registry persistence attempts, and malicious API call
sequences that may indicate the presence of fileless attacks. Spectra implements a hybrid detection
mechanism that combines rule-based detection with Agentic Al reasoning. One of Spectra's unique
strengths is its explainability. The Al module not only detects threats but also generates human-
readable explanations of suspicious actions, mapped to the MITRE ATTACK framework.
Features include:
Data Collection and Logging
Memory Acquisition and Analysis
Feature Extraction
Rule Engine
Agentic Al Detection
Alerting and Reporting
Technology Used:
Python, Volatility3, WMI, Flare, Flask
Supervisor Name:
Mr. Jawad Hassan
Group Members:
Moaaz Nadeem (i22 - 6188)
Zaid Ahmed (i22 -7444)
FAST NUCES ISLAMABAD CAMPUS

INSIDER GUARD
Overview
lnsiderGuard is a security platform designed to protect organizations from internal risks like data
breaches and privilege abuse. It uses advanced analytics to ingest enterprise logs, spot anomalies
in  real-time,  and  provide  human-readable  alerts  to  security  teams.
Core Architecture
The system transforms raw endpoint activity into actionable insights through several integrated
modules:
•  Behavioral Analytics:  Builds baselines of normal activity to detect abnormal logins, file
access, and data transfers.
•  Explainable Alerts: Uses SHAP-based Al to generate clear reasoning behind every detection,
helping analysts make faster decisions.
•  Policy  Engine:  Enforces  rules  for  Data  Loss  Prevention  (OLP),  Identity  and  Access
Management (1AM), and Web Filtering.
•  Forensic Investigation: Provides an interactive timeline of user actions, including keystroke
summaries for incident review.
| INSIDER GUARD  |     | "                                                   | """""" '""            |
| -------------- | --- | --------------------------------------------------- | --------------------- |
|                |     | .o. nour .......                                    | ,0,,,/ ,/ "'·.~;·, ,  |
|                |     | "''" "" ..... ,..,  M,,.,_,,  ", .".  '",'.",', ""  | ',,,. ..              |
'
0 1  DATA INGESTION
Technology Used:
Python, React.js, MongoDB, Mitmproxy,
| l!NO POINT  | FILli  | U5iH.  Nli.TWORK PAOCCSSCS  |     |
| ----------- | ------ | --------------------------- | --- |
AOli.NT5  OPCAATIONS USAGI!  TAAJ"',,.IC  Pywin32, Scikit-learn
Supervisor Name:
Ms. Hina Binte Haq
02. SECURITY CONTROLS
fuwj
G r o u p   M e m b e rs :
~ c P ~
| 0   |     |     | . . . .   .  .   _ _   |
| --- | --- | --- | ---------------------- |
.... __.,., ._...,  ._, .._..._. . 10::__,-.,c. - -. o ;  ........ R .  CS T R I C T I V E   S U R F ING  ., . . . . _ . . . . , .   Malik lna m u ll a h  ( i2 2  - 1 57 6 )
| ,,_-.-,,,.,;";.'-"---", ~ • . .-.~ .O ,C ,O, .<, . ,. | c , J   | . .,. .,1.•. .~, • o .,c.. 0 <.  ... .,. .,.. .,..,- ,_. .,..•  .  N,>  _ |   ,.., _. .   .o . c . ,. o. . . . .,. o. . o... . .. .•  . .~ . . .o , . .-.. .•   |
| ----------------------------------------------------- | ------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
Abdullah (i22 - 1671)
03. THREAT ANALYTICS
Abdul Moiz (i22 - 1704)
®
| Bl!!HAVIC>RAL  | l!IXPLAINADLB  | l!:-PLOVIIE!!l!S  | PC>Rl!!NSIC    |
| -------------- | -------------- | ----------------- | -------------- |
| ANALYTICS      | ALERTS         | SUAVEILL,to.NCC   | INVESTIGATION  |
| 04. TOOLS &    | TECHNOLOCV     |                   |                |

FAST NUCES ISLAMABAD CAMPUS

ASTRA[Automated SOC Triage and Response Assistant]
ASTRA is a cybersecurity monitoring and automated incident triage system designed to detect,
analyze, and manage security threats in real time. The project integrates SIEM and SOAR
technologies to create a centralized Security Operations Center (SOC) environment with minimal
manual intervention. The system collects and monitors endpoint logs using Wazuh. These logs are
processed and stored in the Elastic Stack, where Elasticsearch handles indexing and storage, and
Kibana provides visualization dashboards far monitoring and investigation. ElastAlert2
continuously monitors security events and generates alerts based an predefined rule conditions
(e.g., high-severity events). Alerts are forwarded to Shuffle through webhooks far workflow
orchestration and structured processing.
Afterward, events are sent ta the SOAR platform where they are:
Converted into structured security cases
Enriched with threat intelligence data
Escalated and forwarded to the L2 Analyst/ Incident Response (IR) team for investigation and
manual remediation
The overall workflow follows:
Event Generation Lag Collection (Wazuh) Alert Creation (ElastAlert2) Warkflaw Processing
Case Creation+ Threat Intelligence Enrichment Escalation ta L2 / IR Team.
The system implements core SOC and DFIR practices to provide an efficient and scalable solution
for modern cybersecurity operation.
Keywords: SIEM, SOAR, Wazuh, Security Monitoring, Incident Response
Technology Used:
[Automated SOC Triage and Response Assistant]
Wazuh Manager & Agents, Elasticsearch,
A cybersecurity monitoring and automated incident triage system to
detect anal e and mana e securi threats in real time.
Logstash, Kibana, ElastAlert2, Shuffle, SOAR
ARC
Platform (Automation Engine), Ubuntu,
Webhooks, REST APls, JSON, curl
Supervisor Name:
Dr. Qaiser Shafi
Group Members:
lmama Muneeb (i22 - 1640)
Huda Im ran (i22 -1713)
Shifa Zehra Naqvi (i22 -1727)
Ill.!ll.S.
S TEAM MEMBERS
K Supervisor Name: Dr. Qalser Shafi
Wuuh Elastic Staek EladA!ert2 Shuffle Co•supervisor: Or. Nabeel Ahmed
Croup Members;
lmama t-1unoob (i22 • 1640)
Huda lmran (122 -1713)
Shifa Zehra Na vi i22 • 1727
FAST NUCES ISLAMABAD CAMPUS

Open Source Intelligent Phishing Detection Tool {P-LENS)
P-LENS (Phishing Lens) is a desktop-based intelligent phishing detection tool designed to provide
real-time protection against malicious URLs across multiple entry points such as browsers, emails,
PDF/Word documents, clipboard and QR codes. The system continuously monitors user activity,
extracts URLs  and analyzes them using a hybrid approach combining offline machine learning
models (XGBoost, Random Forest, LightGBM and MLP) with online threat intelligence sources such
as  MISP,  URLhaus,  OpenPhish  and  PhishTank.  Suspicious  links  are  further validated through
sandbox-based dynamic analysis to capture behavioral evidence, screenshots and indicators of
compromise (IOCs). The tool generates risk scores, alerts and exportable reports to help users
make informed decisions and reduce exposure to zero-day phishing attacks.
Features include:
•  Continuous URL monitoring from clipboard, browsers and documents.
•  Offline ML-based phishing classification for zero-day detection.
•  Threat intelligence cross-verification using MISP and open threat feeds.
•  Sandbox execution and behavioral analysis for suspicious URLs.
•  Real-time alerts, risk dashboards and report export (PDF/HTML).
Key Words: Machine Learning, Phishing Detection, Threat Intelligence, Sandbox Analysis
P-LENS
lntelliii:ent Phishin~ O.,tection & URL Monitorin11 Srst•m
| WORKFWW  |     |     | TIMELINE  |     |           |        |
| -------- | --- | --- | --------- | --- | --------- | ------ |
|          |     |     |           |     | Technolo  | Used:  |
Capture URl.s from
multiple sources
Python, CustomTkinter, Scikit-learn, XGBoost,
LightGBM, Docker, MISP, 0penCV, Pyzbar, Requests,
Lihi
Extract features
|                         |        | PHASE I     | PHASE 2  PHASE 3          | f(N;\LI.ZE  |                   | SQLite/M SOL      |
| ----------------------- | ------ | ----------- | ------------------------- | ----------- | ----------------- | ----------------- |
|                         |        | Dataoets    | Model  llaclcground       | Improve     | Supervisor Name:  |                   |
| Offline ML              |        | preproces-  | training  permissions     | UI/UX       |                   |                   |
| cia&<lficatlon          |        | sing        |                           |             |                   | Mr. Qaisar Shafi  |
|                         |        | H,ature     | MISP  Risk score          | Rcdu~       |                   |                   |
|                         |        | extraction  | d ep l o y - calculation  | latency     |                   |                   |
|                         |        |             | m e n t                   |             | Grou              | Members:          |
| Validate results using  | fiiil  |             |                           |             |                   |                   |
|                         |        | System      | lnte§ration               | Improve     |                   |                   |
threat intelligence feeds  Brchitocturc  QR code  repom  Muhammad Hamza ljaz Tung (i21-1562)
| ~---~--~  | ..  | Jesisn  | module  |     |     |     |
| --------- | --- | ------- | ------- | --- | --- | --- |
Optimiz~tion
Option~lly run ,ondbo,  f'¥1  Sultan Umar Cheema (i22 - 1559)
behavioral analysis
Muhammad Arsalan (i22 -1608)
0
1'001,S:
docker

FAST NUCES ISLAMABAD CAMPUS

A Self-Learning Trust-Weighted Multi-Agent Framework for Enhanced
IDS in Healthcare loMT
An Agentic Al Intrusion Detection System is being developed to secure healthcare loMT networks.
The architecture features a Pre-filtration Plane using a Deep Autoencoder to drop benign traffic,
and  a  Multi-Agent Plane  where specialized Al agents concurrently evaluate anomalous flows.
Agent predictions are synthesized via a trust-weighted Bayesian fusion engine. This engine uses a
Human-in-the-Loop (HITL) active learning feedback loop to dynamically adjust agent trust scores,
penalizing misclassifications to quickly adapt against evolving threat patterns.
Features and Results include:
Deep Autoencoder pre-filtration to minimize computational overhead.
Concurrent evaluation via a specialized multi-agent ensemble.
Trust-weighted Bayesian fusion for dynamic risk classification.
Evaluation Accuracy: CIC_loMT (98.56%), CIC_DDoS (97.84%), BoT-loT (94.64%), ToN_loT (88.12%).
Handled  out-of-distribution  drift  on  CIC  IDS  (29.90%)  by  successfully  populating  the  active
-
learning retraining queue.
Key Words: Agentic Al, loMT Security, Deep Autoencoder, Multi-Agent System, Bayesian Fusion.
~J
Team Members
| t:t'  |     |     | /l-°  |     |     |     |     |     |
| ----- | --- | --- | ----- | --- | --- | --- | --- | --- |
• Abdullah Nadeem
i221597@nu.cdu.pk
Ada ptive-1 DS
• Humayun Masood
| overview  |     |     |     | l221749@nu.edu.pk  |     |     |     |     |
| --------- | --- | --- | --- | ------------------ | --- | --- | --- | --- |
• M. Bilal lkram
| An adaptive Al-based  |     |     | Intrusion  |     |     |     |     |     |
| --------------------- | --- | --- | ---------- | --- | --- | --- | --- | --- |
i221636@n u.ed u. pk
| Detection    |     | System        | utilizing  |                   |     |     |     |     |
| ------------ | --- | ------------- | ---------- | ----------------- | --- | --- | --- | --- |
| multi-agent  |     | architecture  |            | with  Supervisor  |     |     |     |     |
dynamic trust based scoring for
Dr. Arshad Islam
real-time threat defence.
Wcoer::kJ  F_low. . I
|     |     |     |     | I   | I   |     |     |     |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
":wu
Signature-Based Filte~ng
|     | Raw Data  |     | C9 (9 Cl'JI  | Kriow11 AlldClu. [)(:JLeCltOll  |          | %          |     |     |
| --- | --------- | --- | ------------ | ------------------------------- | -------- | ---------- | --- | --- |
|     |           |     |              |                                 | i.Y      | •En 1tine  |     |     |
|     |           |     |              | HN<1---~l11                     | ~=11  @  |            |     |     |
P•·•f">t,.c;t>On
01-..;h1:!:sLraliu11
|     | '-1..   |        | --~)               |                     | I   |     |     |                   |
| --- | ------- | ------ | ------------------ | ------------------- | --- | --- | --- | ----------------- |
|     |         | ,?.n,  |                    |                     |     |     |     | Technology Used:  |
|     |         |        | ,,..,,;;io.;,,.,,  | """'"'""''"."'' :~  |     |     |     |                   |
I
~ l~tGl, ••"•"•'"•ltTiu.,rn,. _Al,;;,t  · ~  ~Tru,.IWruc~i,po,"tCod"O''<",y•• a,an  ~ • T . ,,.    CRl:uu:t.c•-lrBenat',!odn   Python 3.9, LightGBM, XGBoost, Snort, Zeek,
'.. .,; ' \ a w
Alerts&. La&:s  Torch (Autoencoder), Scikit-Learn, MCP Server
|     | I   |                                      |     |       |     | I   |     |                   |
| --- | --- | ------------------------------------ | --- | ----- | --- | --- | --- | ----------------- |
|     |     | TrustUpdate~ ~~l~~~'l:~~lf~~~~l::rg  |     |       |     | \,  |     |                   |
|     | -   | Re1nforceent, Learning               |     | B--'  |     |     |     | Supervisor Name:  |
.·=c--
|     | Results  |     |     |     |     | _  .. ____  |     |     |
| --- | -------- | --- | --- | --- | --- | ----------- | --- | --- |
.,_,_..,..,. ••r-......• «• ,.,r_,.  loT",o<)a C)~~~""'''"  Dr. Arshad Islam
| , ..  |     |       |     |     | _.!,;..!_ _  |      |     |     |
| ----- | --- | ----- | --- | --- | ------------ | ---- | --- | --- |
|       |     | - ·   |     |     |              | ...  |     |     |
- ·
| j :              |     |            |     | ...           |     |     |                              | Group Members:  |
| ---------------- | --- | ---------- | --- | ------------- | --- | --- | ---------------------------- | --------------- |
|                  |     | _n_,., --- |     | -.-:.;;_:;..  |     | --  |                              |                 |
| ...... OK-:;;..  |     |            |     |               |     |     | Abdullah Nadeem (i22 -1597)  |                 |
Timeline
|     | ---- |     |     | -   |     |     |     |     |
| --- | ---- | --- | --- | --- | --- | --- | --- | --- |
-
|              |          | Nov-Dec        |     |                   | Mar-Apr        |                | Humayun Masood (i22 -1749)  |     |
| ------------ | -------- | -------------- | --- | ----------------- | -------------- | -------------- | --------------------------- | --- |
|              | Sep-Oct  | • Testing and  |     | .fan-Feb          | • Testing and  |                |                             |     |
| • Extensive  |          | Developing     |     | • Snort • Zeek +- |                | Paper Writing  |                             |     |
LitcrQ.turc  Approaches/  Deep Autoencoder  Bilal lkram (i22 - 1636)
""Ith ,nulti·agenl
|     | Review  | Frameworks  |     |     |     |     |     |     |
| --- | ------- | ----------- | --- | --- | --- | --- | --- | --- |
detection

FAST NUCES ISLAMABAD CAMPUS

Phantom Box
PhantomBox is a lightweight, stealthy malware analysis environment designed to close the gap
between traditional sandboxes and modern, hyper-evasive malware. By combining hardware
spoofing, user behavior simulation and a live telemetry dashboard, it encourages malware to reveal
its true behavior while remaining accessible to organizations with limited hardware resources.
Key Features:
- Anti-Evasion Intelligence: Implements hardware spoofing (CPU, registry, device artifacts) and
masks virtualization traces to bypass modern anti-VM checks.
-User Activity Emulation: Simulates realistic system usage, including file history and fake application
activity, to deceive malware that checks for "human" presence.
- Integrated Analysis Dashboard: A built-in interface for real-time monitoring of processes, network
traffic, and file system changes, supporting both static and dynamic analysis tools.
- Resource-Efficient Design: Built on QEMU and TinylO (a lightweight Windows 10 build) to ensure
high performance on standard lab machines.
Key Words: Malware Analysis, Sandbox Evasion, Virtualization (QEMU), Hardware Spoofing, Dynamic
Telemetry
G
PHANTDMBDX
FASl-NUCES
A Stealthy & Resource-Efficient Molware Sandbox designed to deliver
comprQhen,iva malwore ono1Y$1i in o $of9, non-dQt9Ctable manner.
ARCHITECTURE
' ~19,.
'iil •
Malicious File PHANTOM BO -Analysis
(Input) I Dashboard
..
Technology Used:
TIMELINE
QEMU, Tiny10 (Windows 10), Python, Yara,
strings and various CU-based static/dynamic
analysis utilities.
August S@ptemMr October
Supervisor Name:
TOOLS OVERVIEW .,_. ., TEAM MEMBERS Dr. Sana Aurangzeb
II Sbtic Ahmed Tahir (221-1596)
QEMU Tiny10 Analysis
...~ D:ytnramlsic ,:a ~ a T .. o . f'< o >W ls; e fShell • • H "" a " f " i " z 1 M -m u a h d a A rr r r s n o a la d n M J u a s v t e af d a ( Z 2 a 2 in 1 - (2 1 2 6 1- 3 49 2 4 ) 8 ) Group Members:
Pythonr.::I Scripts • supervisor: Ahmed Tahir (i22 -1596)
Dr. Sana Aurangzeb
Muhammad Arsalan Javed (i22 - 1632)
Hafiz Muhammad Mustafa Zain (i22 -4948)
FAST NUCES ISLAMABAD CAMPUS

PROJECT LOKI
Project Loki is a unified, Al-powered platform designed to combat deepfakes in images, videos, and
audio by providing a comprehensive ecosystem for detection, prevention, and education. The
platform's scope extends beyond simple detection tools, aiming to address the fragmentation of
current solutions by integrating multi-modal Al detection, explainable Al (XAI) and multiple
prevention techniques. It also incorporates a gamified learning hub to raise public awareness. This
holistic approach is intended to provide a robust defense against deepfakes.
Features:
• Multimodal deepfake detection (image, video, audio)
• Prevention Mechanisms Explainable Al visualizations
• Gamified fake-vs-real challenges
• Crowdsourced dataset contribution module
• User performance tracking
• REST API & MCP for external app integration
• Secure file upload and media management
• Responsive web interface
Technology Used:
PyTorch, OpenCV, librosa, FFmpeg, RESTI,
PostgreSQL, React.js, TailwindCSS, torchcam,
LIME, pyC2PA,OpenSSL
Supervisor Name:
Verified Reaults
Awareneaa Dataset
Ms. Sadia Saad
Y\•
Pbu411:RMandationa(Sept-Oct} n-a:0-Dndop.oeot{Jau-Mu-]
• • ~i...nu.nc:N111t.,.t1on Group Members:
• W.termarklng l!I C2PA embedcl.Dg Ho.TY multl-modaldetectioa f!1 MCP
Muhammad Huzaifa Fayyaz (i22-1692)
Phaae 2: E:np,eemenll ti Viluala[Nav-O!q fhNI Fitlalmdoa ,s~ tfMlt-l&Q'j
• Ll.Mcunlu.tlillcrq • •~optlaludan,,aiwldocwiMDWioG.
• EitplainabM Al fl Loki ~1)' • dM-« eolllrillul.ion
Abdul Nafay Azam {i22-1765)
FAST NUCES ISLAMABAD CAMPUS

AutoCOM
Organizations implementing ISO 27001:2022 face significant challenges, including time-consuming
manual policy-to-control mapping (40+ hours per assessment), verification of 93 Annex A controls,
inconsistent audit interpretations, high consultancy costs,  and difficulty extracting compliance
evidence from  large  policy documents. To  address this,  our project develops an Al-powered
compliance dashboard that automatically analyzes PDF/DOCX policies, maps them to ISO 27001
controls using a fine-tuned Sentence Transformer model, classifies compliance levels (Compliant,
Partial,  Non-Compliant),  extracts supporting evidence  snippets,  and  provides  real-time  visual
analytics-reducing audit time, improving consistency, and significantly lowering compliance costs.
Features include:
| • Integrated technical |     |     | + documentation compliance assessment  |     |     |
| ---------------------- | --- | --- | -------------------------------------- | --- | --- |
• Automated security scanning (OpenSCAP, Lynis, osquery)
• Direct mapping to ISO/IEC 27001:2022 Annex A controls
• Control-wise compliance classification (Compliant/ Partial/ Non-Compliant)
• Risk-prioritized GRC remediation recommendations
• Real-time compliance dashboard with visual analytics
Key Words: Machine Learning, Compliance, Automation, ISO 27001 controls, scanning
| AutoCOM  |     |     |     | ~,<,t-1,l 1#/t~  |     |
| -------- | --- | --- | --- | ---------------- | --- |
Supervisor.
|                                                                              |                                                                                                                              |                                                                   | Ms. Aneeqa                            | ..,,-                             |      |
| ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------- | --------------------------------- | ---- |
| Al·Powered ISO 27001:2022 Co~pUM<e D1.1hbo1rtt                               |                                                                                                                              |                                                                   |                                       | :!~                               |      |
| A l l " n i - A : m   i t .   a n   A l                                      | • f' n a h l f w t   . l i l o n u l l ! f i   I ~   ' 7 0                                                                   | 0 \ · , 0 ; > 1   C "" . n n f l                                  | l i . o n a o   Team:                 |                                   | 6    |
|                                                                              |                                                                                                                              |                                                                   | E m a n   F a t                       | i m a  ( 2 2 1 - 1 6 7 5 )   ?:,  |      |
| . ,a 4 n u c d i . , , 1 d o O, r C'   O L m l t M e f ' f I ' U M .t d JO   | ' " n   ' a   1 S \ M i l y E s . I 1 .   t I   t i   n o t n o t   e . a i ;   r 1 a 1 t / 6 ' l   lf l l t d K   p h l a n | t i t u o l n   $ n ) ,   ' , S r U . a . ,   p . s   K  r & in n | d l l i ! n A p J     H u n a i n   R | a za  1 2 2 i ·l 6 1 4 )          | l t  |
| 1 1 , , . , )   f r l   · -                                                  | A   m , f " f l l h . ,   ~ m   l " m \ .   . . . .   r . A                                                                  | t . . . : t r ~   r M W 1 , i                                     | l l W > n                             | ~.tflWJ'I-.:.,:                   | ;    |
| re,;Off"ll"ltll<latl<:nl. The ly$ttm -blu ,;on1111.(l1,.$ wnFl,luo<ce        |                                                                                                                              |                                                                   | M u n i m  T i                        | r m ; u i   ( 2 2 1· 7 4 2 5)     |      |
M<:n.torin&, ,eciu:a .avd t e'Tort. aoo deivtn it:"UCl11red, •'511·
p,ho-TllM ~ ~,..,..,~,~
Technology Used:
Work Flow
Data Collection
& Frontend
31
Python 3.12, PyTorch (CUDA 12.x), Sentence
Dataset collection,
frontend dashboard,
architecture diagram~  Transformers, Sci kit-learn, Flask REST API,
comprehensive testing
Python, React+ Typescript, Vite, Tailwind CSS,
NLP Training  Recharts, NVIDIA RTX 2050 GPU 4GB VRAM
~~def ~~hi1S'b
lei~g!~~
|     |     |     |     | dataset,     | Results  |
| --- | --- | --- | --- | ------------ | -------- |
|     |     |     |     | Integration  | with     |
Dashboa,d
Supervisor Name:
Technical Scanning
Ms. Aneeqa Khalil
ScaB;~8Pts
|     |     |     |     | inte~ration  | with  |
| --- | --- | --- | --- | ------------ | ----- |
Oasnbo:ird, Reports  Group Members:
storage in Database
Eman Fatima (22i-1675)
Finalization & Testing
Hunain Raza (22i-1614)
|     |               |     | 08                    | ReFining model for  |                  |
| --- | ------------- | --- | --------------------- | ------------------- | ---------------- |
|     | CPC R«omrnend |     | a t , o n t   & .     | R P . c o mmen      | dr 1 r 1 o n ~   |
|     |               |     | R e p o f tl f ' lg   | ri n a l   D        | e t a i l e d    |
""'"' .w11J.. .,_,,.,,u,:""-'  Abdul Munim (22i-7425)
|     | 1eml'd1,m::,n gudarce llnddiSplay  |     |     | Report Generation.  |     |
| --- | ---------------------------------- | --- | --- | ------------------- | --- |
,esiia ena  fealt..,-eduhboard
Wllh expo·tllbNt gao .inalys,s
••fl""<1: .t.urhPnt".>tnn .>ori
ctor.g,e :m f r•base

FAST NUCES ISLAMABAD CAMPUS

evoX {Evasion Exposed):
Detecting Advanced Malware Evasion and Anti-Analysis Techniques
Modern malware increasingly uses stacked obfuscations such as control flow flattening, encoding,
packing, encryption, and virtualization to evade static analysis and machine learning-based
detection systems. While existing research primarily analyzes single obfuscation techniques or
limited two-layer combinations, real-world malware often applies deeper multi-layer obfuscations
in specific sequences. The project "evoX - Evasion Exposed" is a research-based cybersecurity
solution focused on detecting and classifying advanced malware obfuscation techniques applied in
layers.
The primary objective of this research is to move beyond shallow layering and develop a detection
framework capable of:
• Detecting whether a binary is obfuscated
• Identifying the number of obfuscation layers (up to 4-S)
• Classifying the specific techniques used
• Predicting the exact order in which obfuscations were applied
The proposed system follows a modular pipeline including dataset generation with controlled
layered obfuscations, feature extraction, preprocessing and normalization, and a multi-stage
classification framework. The system is evaluated using accuracy, Fl-score, and sequence-level
prediction performance.
The expected outcome is a robust, order-aware detection model that can analyze an unknown
binary or malware sample and output structured information regarding obfuscation depth and
sequence, thereby assisting malware analysts in understanding deeply concealed code.
Features Include:
• Detection of obfuscated vs clean binaries
• Multi-label classification of obfuscation techniques
• Prediction of obfuscation layer depth (up to 4-S layers)
• Order-aware obfuscation sequence modeling Key Words:
• Malware Obfuscation
• Layered Evasion Techniques
• Structured Sequence Prediction
r'"'
_/ evoX !Evasion Exposedl:
Detecting Advanced Malware Evasion & Anti- (~ J
"' Analysis Techniques .. .- ,.;., ,
Technology Used:
ff
Challenge !' our SOiution: evoX
:s .:::::.~~:·=~~ Python 3.10, Scikit-learn, CatBoost, XGBoost,
LightGBM, IR2Vec, Tigress Obfuscater, OLLVM,
• Olllayad detection lnc,eues bfuch cost. - Ill Ir '
Rizin Disassembler, NumPy, Pandas
Supervisor Name:
Dr. Zafar Iqbal
Co-Supervisor Name:
Dr. Muhammad Asim
Group Members:
Sana Khalid (i19-19SS)
Umar Ahmad (i22-1743)
-- -
,....1:r9. .....
"""'·~ lbrilhim Jamil -2211631 Ibrahim Jamil (i22-1633)
SUp~rvlsor. Dr. Zafar Iqbal
FAST NUCES ISLAMABAD CAMPUS

WebShield
WebShield is an automated web application penetration testing tool designed to secure modern
web applications, including Single-Page Applications (SPAs), REST APls, and GraphQL services. The
system provides a user-friendly dashboard for security analysts to initiate scans, monitor progress,
and visualize vulnerabilities based on severity and category. Its validation engine uses LLM-driven
dynamic payloads to verify findings and reduce false positives, ensuring more accurate results. The
tool performs automated reconnaissance, OWASP Top 10-aligned vulnerability detection, API
security testing, risk scoring, and generates compliance-ready reports. By integrating with
DevSecOps pipelines, it enables continuous security testing while keeping sensitive application data
within the organization.
Features include:
• Automated vulnerability detection for SPAs, APls, and GraphQL services
• LLM-driven validation engine to minimize false positives
• Risk scoring and compliance-ready reporting
• User-friendly dashboard for scan management and visualization
• Cl/CD pipeline integration for continuous security testing
Key Words: Web Application Security, Penetration Testing, OWASP, LLM Validation, DevSecOps
WebShield@
Abstract:
WebShield is an automated web application security tool that
detects vulnerabilities and uses LLM·driven dynamic payloads to
reduce false positives.
Technology Used:
Python, Flask, BeautifulSoup, JavaScript,
Timeline: Key Features: requests, HTMLS, CSS3, Visual Studio
OWASP·Aligned Supervisor Name:
Vulnerability Detection
Ms. Naveen Khan
LLM·Driven Validation
Group Members:
API & SPA Security Fatima Farooq (i22 - 1678)
Testing
Rizwanullah (i22 - 1767)
Cl/CD Integration
0
Tools:
-~ Is)
'-- )Upyter Ir.I s::, Beautif,efoup r ~ -r'T .r.a- .
Flask li,&j,I 1:,1 Reques"
FAST NUCES ISLAMABAD CAMPUS

FortiLM
FortiLM is a security layer for LLMs that protects organizations from jailbreak attacks, unsafe
outputs, and privacy leaks while keeping the user experience of a normal chatbot. It sits between
users and any LLM as middleware: every prompt passes first through a Hybrid Jailbreak Detection
module that screens for adversarial instructions and prompt injections, then through a Privacy
Preserver that detects and masks PII, and finally the LLM's response is evaluated by Output Filter
that flags and sanitizes toxic, biased, or policy violating content. End users see a simple web chat
UI, but behind the scenes FortiLM logs every decision to PostgreSQLand MongoDB, preserving both
the redacted text and the original content for audit and incident analysis.For operators and
researchers, FortiLM provides an Admin Dashboard that visualizes jailbreak attempts, PII
detections, and harmful outputs in real time, and an Explainability module that surfaces why a
decision was made (e.g. which patterns or model signals fired). Adaptive Learning and plugin
support allow the system to continuously improve: admins can review flagged cases, correct labels,
and feed them back into the ML pipeline, while the plugin architecture makes it possible to attach
FortiLM to existing chat apps, university portals, or enterprise tools. The project evolves into a
general purpose "LLM security firewall" with hybrid model plus rules detection, optimized
deployment, and integrations suitable for academic, enterprise, and cloud environments.
Keywords: LLM Security, Hybrid Jailbreak Detection, Privacy Preservation, Toxicity and Bias
Filtering, Explainability, Middleware.
FortiLM
~'""' "'" -~ 0
t " I t.~ <I ...- "" I ) "" , I!,_. •," ,._. <J •• < I t'>,1 '-> y-. ..., • • I " I, •1..., -.
I '1''1"' tnnq, 1ri, Vnd,•lr; tr,,n, ,,-,,,,, pr,,-."'IP, p,,vn v 1,,,-,1,,:r
,., d n "'' ,tp, 11,, , " • t • 'f " • ,I'\ , I , , , " " ,1,
''"" I' .... ll ''" 1 Ir , ,.,.. ., ,H r,v
PROJl!!CT , ,-.
Technology Used:
Python, FastAPI, PostgreSQL, MongoDB,
Next.js, React, Typescript, PyTorch, Hugging
Face Transformers, Regex, Docker, SHAP/LIME
Supervisor Name:
Ms. Hina Binte Haq
Group Members:
Muhammad Ahmed (i22 - 7441)
lrsam Maan (i22 -7435)
Saifullah (i22 - 1312)
FAST NUCES ISLAMABAD CAMPUS

AirGapDB-AI-Threat Intelligence Gathering & Knowledge Sharing System
A unified vulnerability intelligence platform is being built for high-security, air-gapped
environments. It consolidates structured and unstructured data using crawlers and NLP,
eliminating fragmented analysis across security teams.Penetration testing teams (web, network,
endpoint, thick client) can access consolidated CVE, CWE, CPE, exploit, patch, OEM advisory, and
IOC data through a secure REST API. The platform delivers correlated intelligence, Al-based CVSS
prediction, visual relationship mapping, automated report generation, and controlled manual
updates.
Key features: CVE, exploit, and patch lookup
Al-based CVSS prediction
Automated report generation
Correlation graphs and visualization
IOC prediction and zero-day classification
Keywords :Air-ga pped,Vu I ne ra bility,Correlation, I nte I lige nce,API
O
AI-THREATVAULT
In ~tion with CESAT
An air-gapped platform that aggregates and cnrrelates
vulnerability data for Al-drlllen riskanalysls and reporting.
ARCHITECTURE
Fmpatmaragw J Ee/CW&/Cl)e
qul!ty
Fe
[ OOWJer acnestralicw I ] day claSsifioation ]
6, _J -+[
namauction Ai c-m predicrion
E
[; :,.,"'°:&~i=:J
model update
F"Ftev«iy 7
[ Auto report g~
Technology Used:
TIMEUNE
Python, PostgreSQL, Nodejs, React,Visual
I S<>pt--Oct ] I Nov-Dec I I Jan-11arch 11 April-May I
•o..r:a• colla:tian • Data corre!a.tioo. •Joe matching •1ntegn.ncm El< Studio Code,MISP,NIST
(!t~ "Visullmapping mg;,,.. mpmts-ntion
•Fmnttnd/blclW>d •. Ai/lnl CYSS pndictar "Zero d<y cluster •o.ta import Su ervisor Name:
"Setup Tislllliz~lian
-0..tbot Ms.Naveen Khan
TcAM MEMBERS
Vania Azeem: i22151>2 Group Members:
Taha Nayab: i221010
Abdul Haadi: i220592 Vania Azeem (i22 - 1562)
Taha Nayab (i22 - 1610)
Supervisor Ms.Nween Khan
Co supervisor. DrZafarkp,l
Abdul Haadi (i22 -0592)
FAST NUCES ISLAMABAD CAMPUS

Thick Client Application Penetration Testing Framework (T-CAT)
T-CAT is a modular penetration testing framework being developed specifically for thick client applications.
The  system provides an integrated platform to assess Windows-based Python and .NET thick clients for
security weaknesses. Thick client applications interact with both local resources such as configuration files,
registries, and embedded databases, and remote servers, which increases their attack surface. Existing
tools like IDA Pro,  Ghidra, Burp Suite, OllyDbg, and mitmproxy address specific aspects of testing but
operate separately and require advanced expertise. This creates a fragmented and time-consuming testing
process. T-CAT brings together local storage analysis, static binary inspection, lightweight traffic validation,
and  automated reporting within a single framework. The tool detects plaintext credentials, hardcoded
secrets,  insecure communication channels, weak TLS configurations, and outdated binaries. It generates
structured PDF and HTML reports with CVSS v3.l  severity scoring and non-destructive proof-of-concepts.
The modular design allows future extensions without affecting existing functionality.
Features include:
•  Local storage analysis of configuration files, embedded databases, and registry entries for exposed
sensitive data.
•  Static binary inspection to extract strings, DLL imports, hardcoded secrets, and detect DLL hijacking
risks.
•  Lightweight traffic validation to detect plaintext transmission, weak TLS versions, and insecure
certificates.
•  NSRL hash matching to identify outdated or vulnerable binaries.
•  Automated vulnerability reporting with CVSS v3.1 scoring and embedded evidence.
Key Words: Thick Client Security, Penetration Testing, Static Analysis, Traffic Validation, CVSS v3.1
~...... ....t.;...,j .
THICK CLIENT APPLICATION PENETRATION
TESTING FRAMEWORK (T-CAT)
lo automate security testing of Windows thick client
applications in a single modular framework
ARCHITECTURE
|     |     | @   | E";,  |     |
| --- | --- | --- | ----- | --- |
-
|     |           | L . .                                                              | L . J ' l i l                               |     |
| --- | --------- | ------------------------------------------------------------------ | ------------------------------------------- | --- |
|     |           | _ _                                                                | '- " ' - ~ " - " - ° " " " '                |     |
|     |           | .-.. .,....,   - ·   S f _A _. V MM.A K. .L .l .\" l . Z ' 4 .I A, | A, .  l l   . 'I "   A N /J . . Y, .~U A  , |     |
|     | T-cAfG U  | _ _ c  . . ~                                                       | .  . .   o w                                |     |
(USf.lt~
[r
(1:!~ &'I
|     |              | REPOH 'I NC  M O . )U ., l. . l  .  | J, l ; T W '." C "M I- K " 1 " 1 ! 'A  _ ~ C  |     |
| --- | ------------ | ----------------------------------- | --------------------------------------------- | --- |
|     | 0\ / T P U T |                                     | T . . . _ , , , _                             |     |
: i U L T~   '" " '" "   " ' n - s· ~ , r . - . . .. ., . ..  . . . . ,  Technology Used:
Tl MELINE
Python 3.9, Tkinter/CustomTkinter, Pefile &
| • Core Engine  | • StuticB-n:uy  | • Load Storage  | • Nctv.·ork Traffic  |     |
| -------------- | --------------- | --------------- | -------------------- | --- |
ilSpy, Scapy & PyShark
| • GI.JI fo11nl'Vl1inn  | (P.rtFnrh!d r,h~~-,j  | (~tPnt1M r,hl¥:e)  | (p11•M'1f'<tph:1._..,)  |     |
| ---------------------- | --------------------- | ------------------ | ----------------------- | --- |
| • Stat c Binary        | • LDcal Storage       | • NetworkTra"flc   | • Repcnlrg              |     |
(i-,ittal p~.¼C)  (initbl ph,11.:,c)  (initid pha:;.c)  • lntcg:rs1tion ond  Su  ervisor Name:
P:"lli,.hinf
|     | IV  | --n .  |     |     |
| --- | --- | ------ | --- | --- |
Sept· Oct  Nov-Dec  .. an -Fco  March -April  Mr. Mehmood UI Hasan
IQQ.!.S
Group Members:
|     |              | ,tj          | 0i  |                            |
| --- | ------------ | ------------ | --- | -------------------------- |
|     | M1c r01 ofr  |              |     | Aneeqa Mehboob (i22-7446)  |
|     | .N E T       |   ,.,..,  •  |     |                            |
Fatima Babar (i22-1565)
| Team:                    |     |     | Supervisor:          |                           |
| ------------------------ | --- | --- | -------------------- | ------------------------- |
| 1227446 llreeca Mehboob  |     |     | Mr Mahmooc Ul Hasan  |                           |
| 1221565 rat1ma           |     |     | Co-Supervisor.       | Zujajah Usman (i22-1733)  |
| 1221733 Zu,aJah Usman    |     |     | Ms tJaveer Klrarr    |                           |

FAST NUCES ISLAMABAD CAMPUS

AFAA - Android Forensic & Automated Analysis
AFAA is a digital forensics platform designed for law enforcement and cybersecurity professionals
to extract, analyze,  and  report on  data  from  Android  devices. The  application  provides two
operational modes - Investigator View and Admin View - the former enables forensic analysts to
perform device extraction via ADB, analyze communications and media, detect malware traces, and
perform Al-powered face recognition on extracted photos/videos. The latter is for administrators
who manage user access, configure security policies, and maintain audit logs. All extracted data is
stored in encrypted databases with tamper-proof integrity verification to ensure chain-of-custody
| compliance  |     | for  | legal  |     | proceedings.  |
| ----------- | --- | ---- | ------ | --- | ------------- |
Features include:
•  Extract data from Android devices including calls, messages, contacts, photos, and apps
•  Al-powered face recognition to identify persons of interest in extracted media
•  Image enhancement to restore degraded or low-quality photos
•  Malware forensics to detect traces of malicious activity on device
•  Timeline analysis and intelligent search across all extracted data
•  Generate professional forensic reports for court proceedings
•  Multi-case management with secure, encrypted databases
•  Real-time dashboard showing extraction progress and case statistics
Key Words: Digital Forensics, Android Analysis, Face Recognition, ADB Extraction, Malware Forensics
AFAA
V
ANDROID FORENSICS & AUTOMATED
| ':.(,  | ANALYSIS  |     |     |     |     |
| ------ | --------- | --- | --- | --- | --- |
Al-powered Andro,d forensics plotlorm for doto e.:trocflon, molwore fo1ens1cs,
lmoge enhancement, Face recogni1ion & court-admissible reporting
Devk:eAcquhttlon
11,(J!Jt,:tr.CtlOn. LO&ie,,1 itnel n&, C>eviees,rOf•Un&
Dill Parsing E"l,IIIM
li'etadM.a t!l{traeLon, r,1e eU~,1,c.a,1,on, Artif.1.ct ind~,ric:
I~)  _'"'"«-"11coton,M•••"·"•"°"•'m. .. Mh""'4~«. P.tto·o""'I"'"°"
WJ.  Technology Used:
"~l~A
S.Vch, fib.If ,Pr•~ en rntda, CU11r1dJr1  Python 3.11, PySide6, TensorFlow, DeepFace,
A..tDm.._•d R•parting
COurt·rtoldy rtl)ort, Eli:l)Ol't to PDf . fv,clfllCt W'Tirl'llfY  OpenCV, PyTorch, SQLite, ADB (Android Debug
;
Bridge), Pillow, Argon2, Visual Studio Code
Supervisor Name:
Dr. Zafar Iqbal
|     | ltef11Uon4  | n   |     |     |     |
| --- | ----------- | --- | --- | --- | --- |
(Apr-May)
|     | Optim1zinion.  | C,U     |     |                              |     |
| --- | -------------- | ------- | --- | ---------------------------- | --- |
|     | Testing&       |         |     | Group Members:               |     |
|     | Fmal1zat1on    | OpenCV  |     |                              |     |
|     |                | >(I     |     | Syed Ariz Usman (i22 -1607)  |     |
A l &   r...B-l
I n t e l li g e n c e
tteut,on2  l n t o g r a t io n   Supervisor  Zainab Kayani (i22 -7424)
| Co,e        |     | Dr Zofor Iqbal  |     |     |     |
| ----------- | --- | --------------- | --- | --- | --- |
| Processing  | 0   |                 |     |     |     |
Co-Suporvf~Of'
| &   |     | Dr. Mu~mmad AsJm  |     | Fatima Khan (i22 -1603}  |     |
| --- | --- | ----------------- | --- | ------------------------ | --- |
13-f>•OCI}  lt•ratlon1  Structurin8
Team Members
| Foundation  |         | Fot mo Khon  221-1605       |     |     |     |
| ----------- | ------- | --------------------------- | --- | --- | --- |
| &Core       | SQlite  | Ariz. Usmon  22i-1607       |     |     |     |
| Setup       |         | Zoll"IOb Koyar1I  221-7424  |     |     |     |

FAST NUCES ISLAMABAD CAMPUS

AEGIS: Privacy Preserving Encrypted Traffic Anomaly Detection
AEGIS is a cybersecurity system that detects threats in encrypted network traffic without
decryption, preserving user privacy. It identifies malicious activities, including command-and-
control communication, botnet behavior, and data exfiltration, by analyzing flow-level metadata
and statistical traffic features in real time. Using machine learning-based anomaly detection and
Explainable Al (XAI), it distinguishes suspicious patterns from normal behavior while providing
interpretable insights. A monitoring dashboard visualizes alerts and detection results for security
analysts.
Features include:
• Detection of anomalies in encrypted traffic without decryption.
• Real-time flow metadata collection and feature extraction.
• Machine learning-based anomaly detection model.
• Integration of Explainable Al for transparent decision making.
• Visualization of alerts through a threat monitoring dashboard.
• Continuous model improvement through updated traffic patterns.
Key Words: Encrypted Traffic Analysis, Anomaly Detection, Privacy-Preserving Security, Machine
Learning, Explainable Al
r,,.1,•,,1tH•r•, l\.1,1t11<l (; II 11,, :,.-•;.,,-4;~Ylil
..- ,.orno I l,11, ,-,,LIi j;>;• 1C.fi:"\
A.t·l,HJ A•p• r•,1 j;.>;.> 1hlf',)
•,11r(•rvi•;or· r,.,,~ A(lin 11,•hm.,n
AEGIS: PRIVACY PRESERVING
REAL-TIME ANOMALY DETECTION
FOR ENCRYPTED NETWORK
TRAFFIC
Solution
•Detect.Ion .Ret1u.lt
("""'\ t;.::
~ , / 'Q T1hr:e;a;t~ Alerdn. Technology Used:
Python, ML frameworks, MERN, ELK Stack
Supervisor Name:
;;~O _, • / 4~ R•11il Tim•
Foat:un)
Machine E•tractlon Mr. Aqib Rehman
Lear-nlna Model
(Anomaly c..__ "-
Detection) ,.. Group Members:
()
F•ature
Engineering Ashfaq Ahmed (i22 - 1616)
Module
Sarni Ullah Butt (i22 - 1663)
Mahad Gillani (i22 -9898)
TOOLS USED:
FAST NUCES ISLAMABAD CAMPUS

Autolead Al
Auto Lead Al is designed for sales agents and managers. The Agent View helps sales staff improve
through call coaching feedback, analyzing conversational metrics like pace, words per minute, and
filler words. Concurrently, the system uses machine learning and keyword filtering to categorize
calls on a percentage scale as a hot lead, cold lead, or spam. The Manager View allows oversight
of these categorized leads and agent performance metrics.
Features include:
•  Percentage-based lead categorization (hot, cold, or spam).
•  Agent call coaching feedback (pace, WPM, and filler words).
•  Spam detection via keyword filtering.
•  Advanced NLP analysis using RoBERTa and BERT.
•  Python-based machine learning architecture.
Key Words: Lead Categorization, Call Analytics, NLP, Machine Learning, Python
•
To .analy,o,coach
uidc:•~orlu
|         |     |     | .s:,lcs CIils u  hot.  |     |
| ------- | --- | --- | ---------------------- | --- |
| SCOPe:  |     |     | cotCI or spam 1.Hd$'   |     |
usr"g adv11nced Al
• A<Mmtltd tor.;d c,1eii,1itallOnCttOl, COld,Spjiml
• C.UC:O..C,,11'1!:fMdllillCJ fcrAOnlllPIC@. WPM,'1ller~ll
| • $1)(,n, 0.1,~1•11~ .A~ l<ty,•~ n11  | "''  |     |     |     |
| ------------------------------------- | ---- | --- | --- | --- |
• M•••'¢•tUlll> ~...tt•~_..il\& MNllbil!ncJ &Cl!'!'
• PylhOn 8"$9<1 M~ archilKl"•·
~ c::.~
| ~ -.... |     | Arclitecture Diagram  |     |     |
| ------- | --- | --------------------- | --- | --- |
.....
....... ...,
Technology Used:
| Tlmeline:               |                                               |                         | Python, Bert, Flask, Roberta                                 |                   |
| ----------------------- | --------------------------------------------- | ----------------------- | ------------------------------------------------------------ | ----------------- |
| Sept-Oct                | Nc,,v-.Occ                                    | Jan-Mar                 | Apr-May                                                      | Supervisor Name:  |
|                         | e • 1 1 c o w n 1 1 \ 1  ~                    | D M~  H • • ~ U V • c   | . . a l : l i l   : ; : . . ~ 1 - ' M l                      |                   |
| 0 .1 A H 1  C           | o U .c : t l on  t. , o n - . - n 4           | , _ . , .  , 1 u e      | t l t \ l   a n d   ., . . . . . _ . . , . .  _ . ,. , .. _  |                   |
| $ t i . . , .  f 'l l t | t r l n J                                     |                         |                                                              | Mr. Arslan Aslam  |
| tm p W m e , ,          | t a 1 l o n   . . . . _ d C 1 - - l f l a t e | : :- M ll u t c a f o . |  A p n . . . . .                                             |                   |
|                         | o n r . c o rc t e o e ; d                    | h                       | n . - l l w l l u .  . . . .                                 |                   |
Group Members:
Toots:
Haider Asif (i19 - 1728)
|     | RoBERTa  | t,!:Iask  | BE.RT  |     |
| --- | -------- | --------- | ------ | --- |
Aima Asghar (i21 - 2772)
&rou Members
Awais Ahmed (i18 -0745)
|     | s111ervlsed BJ:  |     | AWals Alwl'\cdjlSl·07451  |     |
| --- | ---------------- | --- | ------------------------- | --- |
tioldc-, .11>ift18i·l72t)
Mr.Arslan Aslam
Alma A1,Q>11,tf;>I Vi177ll

FAST NUCES ISLAMABAD CAMPUS

SmartCam Shield
Smartcam Shield is an loT camera security monitoring system that automatically discovers and assesses
vulnerabilities in smart IP cameras on home and office networks. The system utilizes Python Flask backend
with ONVIF protocol, RTSP detection, and network scanning (nmap) to identify connected cameras and test
for security weaknesses including default credentials, insecure open ports (Telnet, FTP), outdated firmware
with known CVEs, and internet exposure. A React.js dashboard with Tailwind CSS provides real-time
visualization of device status, vulnerability timelines, and quantified health scores (0-100 scale) with
CRITICAL/HIGH/MEDIUM/LOW risk categorization.
Key features include comprehensive scan history tracking, PDF report generation, Email/SMS alerts via
Twilio integration, camera grouping for multi-device management, and context-aware remediation guidance
for non-technical users. The project successfully demonstrates automated loT security assessment, provides
actionable insights for improving home network security, and delivers a complete end-to-end solution
bridging gap between technical vulnerability detection and user-friendly security management.
Keywords:
loT Security, Network Scanning, Vulnerability Detection, ONVIF Protocol, Smart Home Security, Real-time
Monitoring, Health Scoring Algorithm, Camera Management, Cybersecurity, Automated Risk Assessment,
RTSP Protocol, Remediation Guidance, Alert Management, Dashboard Visualization, Firmware Analysis
.,...;.
NElWOR1< VULNERABILITY FIRMWARE
SCANNING DISCOVERY DETEtllON ANALYSIS
1- -mmmma-~l·
Technology Used:
gg
Python 3.8+, Flask, React.js, JavaScript, Node.js,
Vite, Tailwind CSS, ONVIF Protocol, RTSP,
__
HTTP/HTTPS, JSON, Docker, nmap, Requests library,
C
S
O
C
M
A
P
N
R
H
E
I
t
S
iE
T
N
O
S
A
IV
V
E "M.
C
U..
i
L
R
.".T
O
,I -
U
D-P E
I
V
N
I C-C E
Reportlab (PDF generation), Flask-Mail, Twilio, VS
c.1iann, ...- vfor
'""'"rtod~
Code, Git
Supervisor Name:
DR Subhan Ullah
Group Members:
REM N E O O N IA •T T E IO C N H N G I U C I . D A A L N CE ~ r -G Pi "E Oi "N -F " E R- "R E • - A P lT -O rIO: R~ lN T n • E ~ MA E lt/S ~ MS : A r L i E : R . T . S . M. Haziq Hussain (i22 -1685)
~r,.,.n,r,ita,...rtat-
rll'f'l'WlA•k-,1•~
4B3iitM!·Bl-id35 43·1·1114ti3SHl3+t Ali Virk (i22 -1625)
SUKtYIMIII:
o~-.-.illtv.NUUNt
Uzair Zahid (i22 -1619)
~O~il'"4CM88tS.
\W,IIV,t-lOtzl!l-dlt+
FAST NUCES ISLAMABAD CAMPUS

Zero Trust Identity and Access Management for Agentic Al
Our system is being developed as a secure multi-agent identity and access management platform,
keeping the perspective of distributed computing environments and enterprise security
requirements. There are two operational layers of this system - Agent Layer and Adm in Control
Layer- the former consists of super agents, sub-agents, and ephemeral agents that perform tasks
across distributed machines, while continuously authenticating using decentralized identities
(DIDs) and verifiable credentials. The latter is managed by the administrator, who controls identity
issuance, policy enforcement, trust evaluation, and real-time monitoring through a centralized
dashboard.
The system ensures that every agent must cryptographically prove its identity before accessing
resources. Authorization decisions are dynamically evaluated using a policy engine based on Zero
Trust principles. In case an agent attempts unauthorized access or exhibits suspicious behavior,
the Host Intrusion Detection System detects anomalies in real time and automatically isolates the
agent using active response mechanisms. If required, the administrator can manually revoke
credentials, update policies, or quarantine the compromised node through the control dashboard.
Features include:
• DID-based authentication and Verifiable Credential issuance for secure agent identity
management and Agent Naming Service for agent discovery.
• Zero Trust dynamic access control using policy evaluation engine.
• Real-time Host Intrusion Detection and monitoring using Wazuh.
• Automatic isolation and trust score adjustment upon detection of malicious behavior.
• Centralized ad min dashboard for managing identities, policies, and monitored
endpoints.
Key Words: Zero Trust Architecture, Decentralized Identity (DID), Verifiable Credentials, Host Intrusion
Detection System (HIDS), Multi-Agent Security.
ZTrustID
Zero Trust JAM for Al:{cntu·
.. __.....,,.. .. i,1 _.., t.1. ..H lvan.d~. . i.,_.,.._,_._. 1••llc.nnuAl ..... lkY"PflL...._Jl.,nl
. . ! . . , . . 1 . . o . . > . . . . . , , . . 1 . . . . . , . . . ,· , . , . , . . , . . . . . . ( . . . n ., . . . 1 . . . t . . h . .. . . . ) . . , . 1 , . . v . . , . ... . i r . , . ,1, . -1 .. ,b. . . . 1, . ,, . 1. . ,. . ._ . . (r . , . .. . ,A . .. . .' . ) . . . . . .. . .. 1 . ... , . . ,. . , , , . 1 ,, . ~" .. . '(. .\ ·"r") . " .. ·, . , . ..,. . .. .. ' .. " .. ' .. . . . . .• . . ." , .'. " . . . . . ". . . "" . ., " 1. '" .1. '· .,. " r, . ' , • .. " .. . ., . ., . . . ,, Technology Used:
: n sw r. n S • 1 r 1 v h 1 l11 - t1 ., 1 · -.1 l ll l l ! ,, ) h .J Node, React,python, DIDs, VC, Zero Trust,
Cu buno•n l:,;c,I nu
1,r• .-!'(lf"(lr l'-lbfll OPA, Wazuh
Objective:
Right Agent Can Access Right Resour-cea at Right Time. Supervisor Name:
Dr. Subhan Ullah
- Group Members:
-•
,L ! . -- J ~ ]J Mustansir Hussain (i22-1764)
.,=- --==-~
l! !l ~ fe --,._o Saad Mehmood (i22-1655)
' --e-~
Muazam Ali (i22-1734)
Tools and TeC.":hnolo,cles:
.:i:, 'W3S"'
"•de- It. t ~ dock~r
e
• rnc, ..g o f'2:i Grol< [•.so•9 WOZUh.
FAST NUCES ISLAMABAD CAMPUS

NetSec
The NetSec Toolkit is being developed from the perspective of cybersecurity professionals,
penetration testers, and network administrators to streamline defensive security operations.
Operating as a full-stack network automation platform, it features a unified, web-based dashboard
that interfaces with an optimized, concurrent C programming engine. Users can leverage this
architecture to conduct comprehensive network penetration testing, executing high-speed port
scans for target profiling and launching multi-threaded L3/L4 kinetic stress tests, including TCP
SYN, UDP, and ICMP Dos flood attacks. Additionally, the toolkit facilitates automated credential
auditing via SSH and Telnet brute-forcing using custom wordlists, alongside a robust configuration
audit module specifically tailored for Cisco IOS security. This module securely connects to network
devices to evaluate compliance with standard security baselines-such as password policies, VTY
access controls, idle timeouts, and secure SNMPv3 configurations. If a device is found to be
vulnerable, users can initiate one-click automated infrastructure hardening patches directly from
the dashboard to remediate non-compliant devices. Finally, to ensure thorough post-engagement
documentation, the system features dynamic PDF session report generation that meticulously logs
all diagnostic tests, attack statuses, and configuration changes.
supervisor:
NetSec Or Subhan Ullah
Group Members:
Automated Vulnerability Detection Muhammad 221·1612
& Secure Configuration Syed Arham Ahmed 22i-lSS2
Validation Tool For LAN Mohammad Azan 22i• 1668
:-t: Problem Landscape f.1 Proposed System: NetScc
E&qlGii
MiNfi&l\:bWHH
Open Ports Wed,,. Criedcntials M•:scon,gurations
l
Smcill and medium LAN env.-onment!i often H·i·Hi/i:f#MMI
remain ..-ulnenble duet:> inseci.xe configurations.
Technologies Used:
cxpor..cd scrvi:c$, ,ve.:ik. .luth~ticat10f'\ ilnd lack
of autom:lted continuous validation. \ii
Python, C, Netmiko, Report lab, Flask,
Parrot OS, GNS3, Cisco ISO
Su ervisor Name:
Ched::: configunitions
- I. ,_..... Dr. Subhan Ullah
Group Members:
Genercte risk ba~ed report
Syed Arham Ahmed (22i-1552)
Vulner~bl~ Secure
Network NettAork
Devkv~ Dev,ce~
Muhammad (22i-1612)
a.
1J Muhammad Azan (22i-1668)
Flask
"rgon2
FAST NUCES ISLAMABAD CAMPUS

HorizonSec
HorizonSec is an Al-driven endpoint threat analysis tool specifically for Windows 10 and 11,
designed for non-technical users to help them understand and assess security risks without
requiring deep cybersecurity knowledge. The system scans the computer to identify system
vulnerabilities, monitor for malware and unauthorized access, and provides an intuitive interface
with easy-to-follow reports, making cybersecurity awareness accessible to everyday users.
Key Features:
• Vulnerability Assessment: Automated scanning to check the system against a CVE dataset.
• Hybrid Malware Detection: Identifies threats using a dual-method approach of signature
comparison paired with an Al classifier.
• Attack Simulation: Safely executes more than 100 simulated adversary techniques to test system
defenses and educate users without causing actual harm.
• Al-Powered Report Generation: Uses a RAG engine to translate complex technical data into
personalized, plain-English summaries and mitigation steps.
Key Words: Python, Flask, ChromaDB, RAG, Threat Intelligence, Attack Simulation
Technology Used:
Python, Flask, ChromaDB, HuggingFace,
Atomic Red Team, phi3-mini, NVD,
malwarebazaar
Supervisor Name:
Ms. Sadia Saad
Group Members:
Abdul Sarni Qasim (22i-1725)
Ahmad Abdullah (22i-1609)
Muhammad Ta Iha Bin Oba id (22i-1577)
FAST NUCES ISLAMABAD CAMPUS

AuditX
AuditX is a network device auditing platform which parses device configurations (HPE Aruba AOS-
S, Cisco IOS/I0S-XE), builds a vendor-agnostic model, and evaluates YAML-based audit rules to
report compliance findings. It integrates with Batfish for multi-device network analysis and
topology visualization, and leverages RAG-based Al to provide natural language querying and
intelligent remediation guidance.
Features include:
TextFSM-based configuration parsing into a vendor-agnostic model
VAML-driven audit rule evaluation with pass/fail/N/A results per check
Al-driven risk prioritization and severity scoring
Intelligent false-positive reduction using contextual validation
Multi-device network topology analysis via Batfish integration
Audit report generation with compliance framework mapping
Key Words: Configuration Auditing, Compliance Automation, Vendor-Agnostic Configuration, Network
Topology Analysis, Retrieval-Augmented Generation (RAG)
M
AuditX
TD aut0Nt• natworll conftguu1tion auditing and CMS)lianu ac:rcss .aJlti•vtndor
Technology Used:
Python, Batfish, YAML-based rule framework,
JSON normalization models, SQLite, Docker,
React, RAG
Supervisor Name:
©@ 0
---- Dr. Muhammad Asim
Group Members:
Muhammad Jalil Ahmad (i22-1635)
Abdul Moeez Siddiqui (i22-1637)
"". .... JaUl AMld 122·1'15
1 I . . M N . I 11 N t i h u H i. 1 1 S 2 i 2 d -1 d 5 iq 51 u i !22-lil7 Umar Niazi {i22-1551)
Supervisor: Ox. HuhariN!d
FAST NUCES ISLAMABAD CAMPUS

Intel Ii SecDashboard
lntelliSecDashboard is an Al-powered intelligent security and analytics dashboard designed to
simplify data monitoring, analysis, and decision-making for both technical and non-technical users.
The system focuses on real-time data processing, anomaly detection, natural language interaction,
and secure system monitoring through a unified web-based platform.
The application provides an interactive dashboard where users can query data using natural
language, automatically generate SQL queries, visualize data in real time and receive intelligent
insights without requiring technical expertise. lntelliSecDashboard integrates structured databases
and real-time streaming data sources to deliver live monitoring and analytics.
The system is designed with strong cybersecurity principles, including authentication, role-based
access control, encryption and audit logging to ensure data integrity, privacy, and secure access.
If the system fails to correctly interpret a query or detect an anomaly, the admin can update
configurations, datasets, and system rules to improve system intelligence. The system continuously
improves through updated models, logs, and admin feedback.
Features Include:
• Natural Language Querying (Text-to-SOL & SOL-to-Text)
• Real-time data integration from databases and streaming APls
• Automated data visualization (charts, graphs, maps, heatmaps)
• Machine-learning based real-time anomaly detection
• Intelligent alerts and notifications system
• Secure authentication, authorization and role-based access control
• Encryption, audit logging and cybersecurity monitoring
• Real-time system monitoring and analytics dashboard
Key Words:
Al Dashboard, Cybersecurity Analytics, Anomaly Detection, Natural Language Processing, RealTime
Monitoring
I ntellisecdash
Your Query, our security
To develop a dynamic, secure, and intelligent dashboard that transforms SQL
queries into human·readabletext and provides insightful data v1suaozat10n using
Python libraries and Large Language Models (LLMs).
,_ lr,fOfflllllian
Data V....aiDlion
Technology Used:
Python, Flask, MySQL, Machine Learning
NMWlli.an 0 ,u - .a ,, ,i P t .. N . L c U • il J . a .. a S l Q l lcuabase (Isolation Forest), LLMs (Google Gemini API),
Web APls, HTML/CSS/JavaScript, REST APls,
Encryption Algorithms, SQL, Cloud Integration
Supervisor Name:
Dr. Noshina Tariq
l ~
.
~.o.u..11.cn.at Co-Supervisor Name:
__ If ~
Mr. Sohaib Khan
.. Group Members:
Manahil Chaudhry (22i-1728)
,
•• Noreen Mazhar (21i-2768)
Abia Javed (21i-0311)
FAST NUCES ISLAMABAD CAMPUS

VIGILON
Vigilon is an Al-powered smart home surveillance system developed to enhance residential security
through intelligent monitoring and real-time threat detection. The system utilizes Artificial
Intelligence and Computer Vision techniques to analyze live video streams, detect camera
tampering, weapons detection, and identify suspicious activities within a home environment. Unlike
traditional CCTV systems that only record footage, Vigilon actively processes visual data to generate instant
alerts and actionable security insights.
The system consists of a single User View designed specifically for homeowners. Through a user-
friendly interface, users can access live camera feeds, review logs and screenshots, and receive real-
time notifications in case of intrusion, tampering, blackouts, or weapons.
Features of Vigilon -Al Smart Home Surveillance System
• Al-Based Weapons Detection: Detects weapons using intelligent algorithms.
• Real-Time Alerts & Notifications: Sends instant alerts to the user in case of tampering or
intrusion.
• Recorded Footage Access: Logs and Screenshots saved can be viewed
• Direct Contact with Authorized Security Personnel: Enables the user to immediately
contact security authorities during emergencies.
Key Words: Artificial Intelligence (Al), Computer Vision, Smart Home Security, Real-Time Monitoring,
Intrusion Detection System
Technology Used:
Supervisor
MS. C N o ah & l W \( l ) ) () e I N '" I r S a O ri r q . YOLOv8, Flutter, Figma, Python (Flask)
ML Uubbra "-m•
PostgreSQL
~ i 20752un•lr•Ahrn.d
22t-lt!57 zar11sh Khan
22i-1~6 ~alaan Azb Supervisor Name:
VIGILON
Ms. Mahnoor Tariq
An Al-powe1ed r11ubile a.pp fo, ,~al-lime ho,ne ::.ur veillance with
instant threat detection and remote monitoring control. Group Members:
Zunaira Ahmed (22i-2075)
Zarlish Khan {22i-1657)
Faizan Aziz (22i-1946)
¥ (l!~vaSOL P
YOLOvB ~ Lask Flutter
FAST NUCES ISLAMABAD CAMPUS

Dfendrix - Network Defense Powered by Agentic Al
Dfendrix is a network defense platform designed with both technical and non-technical users in
mind, including SOC trainees, IT admins, academic researchers, and SME managers. The system
operates through multiple modules-Al-Enhanced Network Monitoring, Agentic Al Classifier, Multi-
Agentic Intrusion Detection System, Attack Response & Mitigation, Attacker Tracing & Visualization,
and a Threat Case Dashboard - to provide real-time monitoring, threat detection, automated
mitigation, attacker analysis, and centralized visualization. Users can review alerts, add mitigations,
and track incidents, while the Explainable Al layer ensures transparent decision-making. The
platform combines traditional IDS/IPS tools (Zeek & Suricata) with Al agents to deliver lightweight,
scalable, and accessible network defense.
Features include:
• Real-time traffic monitoring and log capture with Zeek and Suricata
• Al-based threat classification and anomaly detection
• Automated and manual attack mitigation workflows
• Attacker tracing, gee-visualization, and incident analysis
• Centralized web-based dashboard with dynamic updates and reports
• Explainable Al providing reasoning behind detection decisions
Technology Used:
Zeek, Suricata, PostgreSQL/MySQL, Visual
Studio, ELK, React, Python, XGBoost, CNN,
SHAP/LIME
Supervisor Name:
Ms. Sadia Saad
Group Members:
Ayesha Areej (i22 -1711)
Sabreena Azhar (i22 -1751)
Javeriah Faheem (i22 -7421)
FAST NUCES ISLAMABAD CAMPUS

ScamShield - Phishing URL Detection Plugin
ScamShield is a browser-based phishing URL detection plugin developed to protect users from
malicious websites using a hybrid multi-layered detection approach. The plugin first performs
blacklist verification to instantly block previously identified phishing URLs. If the URL is not present
in the blacklist, it proceeds to a heuristic-based analysis layer where structural and lexical features
such as presence of excessive subdomains, suspicious special characters, URL length, entropy, and
HTTPS usage are evaluated. URLs that remain uncertain are then passed to a trained Machine
Learning model for final classification as legitimate or phishing. Feature extraction and
normalization are applied before ML prediction to ensure accurate results. By integrating blacklist
filtering, heuristic analysis, and machine learning, ScamShield enhances detection accuracy,
reduces false positives, and provides real-time protection directly within the user's browser.
Features include:
Blacklist-based filtering of known phishing URLs
• Heuristic analysis of suspicious URL patterns
• Feature extraction and preprocessing
• Machine Learning-based classification
• Real-time URL testing and prediction
Key Words: Phishing Detection, Blacklisting, Heuristic Analysis, Machine Learning, Cybersecurity
Real-Time Phishing Detection
The Growing Problem
$ Phishing uuuck.9 incr<:using every ycur
rake wcbsilcs look identical lo r-cal onc5
E> Users cunnol cusily identify scum linki;
b
Our Solution: ScamSbield
0 Comprehensive. multi-layered detection engine Technology Used:
"0" $°(1fc preview mode for secure browsing
0 MinimaJ Latency "ith clicm-sidc intcfcrcncc Python, Scikit-learn, Pandas and Numpy,
Joblib, Google Colab
How It Works
Supervisor Name:
Visit Cra"'ler Blacklist Threat Maam Sana Aurangzeb
Website Extracu Heuristic & Classification
I
Group Members:
Maria Maqsood (i22 - 1651)
Rozina Wali (i22 -1779)
Muhammad Ibrahim (i22 - 1686)
FAST NUCES ISLAMABAD CAMPUS

ScanShield
ScanShield is an automated cybersecurity tool designed to perform pre-deployment security
compliance checks on IT devices before they are connected to an organizational network. In many
organizations, devices such as desktops and laptops are deployed without proper security
validation, exposing networks to risks such as outdated firmware, weak configurations, malware,
and unauthorized software. ScanShield automates device detection, security auditing, and
compliance verification, reducing the need for manual inspection by IT administrators while
ensuring devices meet required security standards.
Features include:
• Automated device detection and system inventory collection for connected devices
• BIOS, firmware, and hardware configuration validation for security compliance
• Port and interface monitoring for USB, external devices, and other hardware interfaces
• Software integrity checks and vulnerability assessment using CVE/NVD databases
• Generation of detailed security reports with remediation recommendations
• Web dashboard for scan control, monitoring, and management
• Al-powered chatbot for querying scan results and obtaining security insights
Technology Used:
Python, React.js, Flask/FastAPI, Microsoft
Defender APls, LangChain, FAISS, REST APls
Supervisor Name:
Ms. Hina Binte Haq
Group Members:
22i-1659 Muneeb Kashif
22i-1702 Abdul Samad
FAST NUCES ISLAMABAD CAMPUS

Al PenTap
Al Pen Tap is an Al-powered and integrated USB penetration tester that aims to facilitate more
complicated cybersecurity tests among students and cybersecurity specialists. It is a device that is
connected to hardware modules of Wi-Fi, RFID, and Sub-GHz testing on one, portable platform
with offline, Al-controlled chatbot functionality.
Features include:
• Multi-Protocol Testing: Integrated modules for Wi-Fi (handshake capture/deauth),
Dual-frequency RFID (13.56MHz/12SkHz), and Sub-GHz signal analysis.
• Al-Powered Guidance: Real-time interpretation of raw technical results into
understandable terms and educational security insights.
• Automated Reporting: Generation of encrypted, exportable security reports detailing
findings and fixes.
• Offline Functionality: Operates without an internet connection to ensure security and
reliability in isolated testing environments.
• Ethical Safeguards: Built-in limits and logging to ensure the device is used only in
authorized, legal testing conditions.
Key Words: (Cybersecurity, Artificial Intelligence, Penetration Testing, Wireless Security, Raspberry Pi 5)
Technology Used:
Python (Chatterbot, Scapy, Aircrack-ng),
Raspberry Pi OS, CC1101 (Sub-GHz), MFRCS22
RFID
Su ervisor Name:
Mr. Mehmood ul Hassan
Grou Members:
Haad Zia (i22 -1643)
Huzaifa Khalid (i22 -1760)
Syed Osaed Jafar (i 22 -1776 )
ATION 1ES1.I
FAST NUCES ISLAMABAD CAMPUS

Twin Guard
Objective TwinGuard aims to provide secure tunneled remote access and robust user
authentication by leveraging a Zero Tn1st Network Access (ZTNA) framework. The
system focuses on synchronizing physical IoT devices with high-fidelity 3D digital
twins, delivering real-time telemetry and immersive visuahzation through a
centraJized, secure user dashboard.
Project Description TwinGuard is a cyber-resilient solution designed to bridge the
gap between physical IoT environments and advanced digital monitoring. By
implementing a Zero Trust architecture, the system operates on principle of ''never
trust, always verify,'' ensuring that every access request is fully authenticated,
authorized and encrypted through secure tunneling before granting entry to network.
Features:
• Secure Remote Access - Users can safely access their private IoT infrastructure from
anywhere without exposing internal ports to the public internet.
• Real-time Monitoring - Live telemetry updates such as sensor data and device status are
displayed on a secure dashboard.
• 3D Digital Twin Interface- Users interact with a dynamic 3D representation of their physical
environment for better visualization and control.
• Enhanced Security Architecture - Reduces traditional perimeter and flat-network
vulnerabilities while ensuring end-to-end data integrity and proactive threat mitigation.
e
Supervisor
, D iii r , . . Mg,u.",'M..s" F",";,dr• "o"q" ,:C' ,o,I
Twin Guard U Ah m &• a ~ ,,Z k d , , ,< 22 h 1 1 - 1, 1 l 7 f 0 :2 0 2 1.1s1s
H.,1,,...in 10,•q•n 221•1(;81
Twir1Gu:nd pro•1ide.s secure remote access and user cuthent cation vi;i 7TNA It
!.ynchrooizcs. loT device~ to Celiver real·time teh:-1111:!lr }' dr 1u 30 'lhudllzatlon via
dashboard.
-- ARCHITECURE --
Technology Used:
ZTNA, Secure Tunneling, Unity, C#, Arduino,
MongoDB, Python, Flask, and Firebase
Supervisor Name:
Dr.Muhammad Asim
Mr.Shams Farooa (Co)
-- TIMELINE --
Group Members:
Stp·0:1
Umar Zeb (122-1700)
a IG . . ~ L"' : : ~ '. ~ .: ~ .'.4 , -r Abubakar Sharif {122-1575)
Hussain Khaqan {122-1681)
--TOOLS & TECHNOLOGIES --
FAST NUCES ISLAMABAD CAMPUS

Web Watch Hound
WebWatchHound (WWH) is an OSINT-Based Digital Risk Protection (DRP) System being developed
to help organizations monitor, detect, and analyse digital threats across the surface, deep, and dark
web. The system is designed from the perspective of enterprises, cybersecurity teams, government
institutions, financial organizations, and researchers who require an affordable, locally deployable,
and privacy-focused solution for monitoring data leaks and threat actor activities. Existing DRP
solutions are mostly expensive cloud-based Saas platforms with foreign dependencies, which may
raise privacy and sovereignty concerns. Therefore, this project focuses on building a standalone Al-
powered platform that automates threat intelligence collection and analysis while ensuring local
deployment capability.
The system continuously collects data from multiple sources such as paste sites, code repositories,
forums, chat rooms, social media platforms, and dark web marketplaces. It automatically detects
compromised credentials, exposed sensitive information, and potential threat actor activities.
Using Al and NLP techniques, the platform analyses and enriches collected data, reduces false
positives, and generates prioritized, actionable alerts. Each alert includes contextual metadata such
as source, timestamp, severity, and confidence level. The system also provides an intelligent
dashboard for monitoring, triage, and investigation, along with API integration for Security
Operations Canters (SOCs) and external systems.
•
Web Watch Hound (WWH)
..
Comprehensive Digital Threat Monitoring
..
- - "" -..-_:_' ·_ ,-_·~ ,: ---_ .
Web Watchhound
'""""
• -@
f
-+ --+
Al Engine
Technology Used:
React, TailwindCSS, FastAPI, Python,
...®
,
OCR Jh1k Anlfyln PostgreSQL, Scrapy, Playwright, Tor,
LangChain, LLMs (Groq), Docker
Supervisor Name:
Core Tech Stack
II II o ,. Mr. Mehmood UI Hassan
Group Members:
0 • 0l ~
Muhammad Shaayan (i22 -1664)
Abdullah Nadeem (i22 -1759)
Muhammad Musaab (i22 -1560)
FAST NUCES ISLAMABAD CAMPUS

NetSage Al
NetSageAI is a behavioral network visibility and anomaly detection platform built on Zeek and Arkime,
keeping in view the needs of enterprise SOC teams and security engineers. The system passively monitors
internal traffic via SPAN/TAP ports, generates structured Zeek logs and full packet captures, and builds
communication baselines for each device and user. There are two main views - SOC Analyst View and
Security Engineer/A dm in View - the former is used to investigate alerts, search sessions, visualize network
topology, and drill down from high-level anomalies to packet-level evidence, while the latter is used to
configure policies, tune baselines, manage models, and adjust retention settings. When an analyst believes
a detection is noisy or unclear, they can provide feedback through the dashboard; the admin can then
refine rules or ML thresholds, with the system updating future alerts accordingly and attaching brief LLM-
generated explanations to help teams quickly understand why an event was flagged.
Features include:
- Passive monitoring of internal network traffic and automatic asset discovery from Zeek logs and PCAPs.
-Creation of behavioral baselines per device/user and detection of deviations such as traffic volume spikes,
new destinations, and unusual protocols.
- Identification of key attack behaviors including policy violations, SSH brute-force attempts, suspected
data exfiltration, and C2-style beaconing patterns.
- Dual-indexed storage in OpenSearch for fast global search and per-asset history, with full-packet forensic
retrieval via Arkime.
-Web-based dashboards for real-time monitoring, topology visualization, alert management, and
generation of executive and technical security reports.
Technology Used:
NetSageAI Zeek, Arkime, Filebeat, Logstash
BehaYk>ral Networtc v~•A noonulw Detection OpenSearch & OpenSearch Dashboards
Not~ is a passiva n,twork IT'KlrilorTl!if ?latform lhal t:ap'.ln,, tralk: via
SPAN/TAP. ~4"11 it~'ith Zl!ek and Mimt:I, hulclsh&hf:tnotal ba~net, PEW"~-
and detecls anomeilies S4.ICh as lateral tnO\'emitnt, brute-lorce, detA exfitlretior\ afld
C2 canmuni-cation, all presened lhrugh dashboerd!I and reports b SOC analyStS Docker, Bash scripting
-~ ·-
- ~lwk.. · ., - ,.,.... % ,;;- ---.. ' - =- Python (ML), LSTM Autoencoder, CICFlowMeter
n,no,,,,-_.,... .,_,:.._...-.-..
• ,.,. ......., .~kw
-- Supervisor Name:
- - - --- - - = - - - - !, / --·
• ~--- Dr. Zafar Iqbal
.. --
~ -,..,---~
....-....... ~.U.enct-«
-
- -
- Group Members:
- = £ ...... - ~ .. . ~ , " . ' • -g - = - -
- ::;..,.a;:. -
Saif ur Rehman (221-1697)
·······-i.···-·········----i.·-·················r.·····------···r.···
Abdul Muhaiman (221-1694)
.-. --
Umer Farooq (221-0518)
=Grw~pMo:m.tn- =
s.u. ... --.. "'-~
FAST NUCES ISLAMABAD CAMPUS

Aegis - Enterprise Threat Detection & Security Advisory
Aegis is made as a threat detector and security advisor for Small and Medium Enterprise. Its major
modules include an Al based Intrusion Detection System, a Pentest module and an advisory chatbot.
The IDS continuously monitors network traffic to detect malicious activities such as DDoS attacks,
port scans, and DNS exfiltration using Al-driven and signature-based detection mechanisms. When
a suspicious activity is detected, the Pentesting Module performs validation by scanning affected
assets for open ports, exposed services, and known vulnerabilities (CVEs), ensuring alerts are
context-aware and risk-prioritized. The Chatbot Advisor then provides clear, natural-language
explanations of threats, vulnerability severity, and recommended mitigation steps. These modules
work together to form a closed loop; it continuously refines alert severity and response decisions by
feeding validated exposure and vulnerability intelligence back into the detection and correlation
engine. Aegis is designed to be cost-effective, explainable, and extensible, allowing future integration
of advanced threat intelligence or automated defensive policies.
Features include:
Al-driven network intrusion detection system (CNN-LSTM + XGBoost models)
Pentest validation using Nmap scanning
Vulnerability intelligence integration (CISA KEV, NVD CVE data)
Context-aware alert correlation and risk escalation
Natural-language Al advisory with remediation guidance
Key Words: Intrusion Detection System, Vulnerability Intelligence, Closed-Loop Security, Pentest
Scanning, Risk Correlation
Suporvisor
or. s.ana Aurangzetl
G.-ovp Mombor•
Area. Zeb-22 -1561
Soh•r tqbel M•lik -221·8803
Muhllrr,miid Ahmad "41.JsUti'a 22 -1sg1
ENTERPRISE THREAT
DETECTION & SECURITY
ADVISORY SYSTEM
Whoro Al Moots Cybor Dofons•
THE SMI CLOSED-LOOP
SECURITY OAP DU'INSE
. ~- .. - .. . . . . . . . .. . .. - .. - ... - . • A M) U 'b< " 1 'l d fi M Md l i e c tt , • - e y l. a t-•
tlltNflO,....ldet- ffHotlon 1f>Q;!ef1
• .,..,..,,.,. .. p.. ..• •tl"ff
_I.M.,l.<_w...c,: .,t,-__-.•,.. ,..itti o,ld !jl-.OfCII MllFtf
~ noitlgatl. ..
Technology Used:
,,_..,., I
.=;-,
Python, FastAPI, Docker, React, JavaScript,
H)ob,,odN- . .4 . . : l
..o 1. ...., r ! i l~t--..ct.- .o.., J_ , Nmap, Ubuntu WSL, Visual Studio Code, CNN-
f'lpeln.
LSTM Hybrid Model, Scikit-learn, SHAP/ LIME,
l
mol-'<lto.i
u- -.-, _j XGBoost Classifier, Retrieval-Augmented
= 1· Generation (RAG).
..,,_, l'~I
Mech,!. -- Ooc.191' Supervisor Name:
&.9rt,.,.
°""""""-
Dr. Sana Aurangzeb
TECHHOLOO-Y STACK
Group Members:
.t,I & 81:CUtl'fY IACKSND FAOH-TIN0
.£A3ndom
'lforests Areej Zeb (22i-1561)
0 . dock..- @Re
PyTorch
Muhammad Ahmed Mustafa (22i-1591)
MITRE ATT&CK' MongoDB
l::xpress n • cl~®
XGBoost Sahar Iqbal (22i-8803)
FAST NUCES ISLAMABAD CAMPUS

Sentinal360
Project Brief/ Overview
Sentina1160 is a cyhersecmity platform that integrates Digital Risk Protection (DRPS) and External Attack Surface
Management (EASM) to detect and mitigate online threats targeting organizational assets. The system collects inputs
such as domains, IPs, URLs, and brand names, then performs asset discovery and enumeration to identify external
infrastructure including subdomains and cloud assets.
Discovered  assets  are  analyzed  through  multiple  security  detect.ion  module~,  including  DNS  analysi5,  brand
comparison, visual similarity detection, and vulnerability scanning. Sentinal360 also integrates threat intelligence feeds
to enrich findings and provide deeper 1isk context.
A risk seorinJ!; enJ!;ine evaluates threats based on severity and impact, generating Di!!;ital Risk Protection (DRP) reports
and real-time insights through an interactive security dashboard. By automating discovery, analysis, and 1isk evaluation,
Sentinal360 enables faster detection of phishing attacks, domain impersonation, and external security exposures.
Features Include
• Phishing & brand impersonation detection
• DNS analysis & reputation checks
• Visual similarity detection for fake sites
• Vulnerability scanning of assets
• Threat intelligence enrichment
• Real-time security dashboard
User (Organitation)
Organiution security teem
| 01 adtninlstratOf".  | --  |     |     |     |     |
| -------------------- | --- | --- | --- | --- | --- |
r
Asset Input
Domain. IP, URL. Bfancl Name.
|     | List of input types..  |     |     | Technolo  | Used:  |
| --- | ---------------------- | --- | --- | --------- | ------ |
Asset Discovery &
Enumeration (EASM)
| lden1ifylng 11Ud< ""1eee.  |     |     |     | Python 3.12  |     |
| -------------------------- | --- | --- | --- | ------------ | --- |
·SUbdOmans
-Elclo<nal IP,
| ·CloudAsMKS  |                    |     | Flask (REST API Backend)                    |     |     |
| ------------ | ------------------ | --- | ------------------------------------------- | --- | --- |
| r            | External Scanning  |     |                                             |     |     |
|              | Engine             |     | MERN Stack (MongoDB, Express.js, React.js,  |     |     |
Kubemctes worker nodes
StXcOaCl\lalin*Q c c-.an ~archit1 e0c0t1u$r.e .
Node.js)
Detection Modules
| (Parallel Analysisl  |     |     | Docker (Containerization)  |     |     |
| -------------------- | --- | --- | -------------------------- | --- | --- |
Kubernetes (Scalable container orchestration)
•=--
| '  ..___,_ ,  |     | '\  | Google Search Engine/ OSINT APls (Threat  |     |     |
| ------------- | --- | --- | ----------------------------------------- | --- | --- |
Threat Intelligence
|     | & Data Enrichment  |     |     |     | discovery)  |
| --- | ------------------ | --- | --- | --- | ----------- |
concextualtllnQ llnOings witn
globol fotds and databases.
• Enhanced risk context.
Su
| Risk Scoring &  |     |     |     | ervisor Name:  |     |
| --------------- | --- | --- | --- | -------------- | --- |
Correlation Engine
| Analyzrog Impact, colcLlatlng  |     |     |     | Dr.Muhammad Asim  |     |
| ------------------------------ | --- | --- | --- | ----------------- | --- |
risfic SCOre$.
• C-orneclbg tnrtat data.
|     |     |     |     | Grou  !Vlem hers:  |     |
| --- | --- | --- | --- | ------------------ | --- |
DRP Security Report
| r  ..  |     |     |     |     |     |
| ------ | --- | --- | --- | --- | --- |
-~-•-_=__ _  c,o. .m m@NbtiOM, and
ore_. exe_clu·e-tdivf.i fst-Udif_n'l'glffsl,rr_y .  _. ,  Syed Fassih {22i-1730)
• Actionlble Insights.
Ahmed Umar (22i-1580)
Security Dashboard
&An;ilytlcs
| Real-time visualiz:alion of  |     |     | Ahmed Shahzad (22i-1578)  |     |     |
| ---------------------------- | --- | --- | ------------------------- | --- | --- |
dgitalrtst.
• Seo..irhy t1end1 and mettles.

FAST NUCES ISLAMABAD CAMPUS

AegisNet: Encrypted Traffic Analysis
AegisNet is a next-generation, cloud-based security system engineered to detect Advanced
Persistent Threats (APTs) and malicious activities within encrypted traffic, entirely bypassing the
privacy risks and massive computational overhead of SSL/TLS decryption proxies. Deploying
lightweight endpoint agents, the system feeds network flows into a sophisticated, multi-tiered Al
architecture trained on custom sandbox datasets. It first establishes a localized behavioral baseline
via unsupervised learning to minimize false alarms. The core engine then utilizes JA4 network
fingerprinting and flow statistics for real-time threat monitoring. Suspicious traffic triggers a
secondary deep learning layer that analyzes initial packet sequences to classify attack vectors, map
them to MITRE ATT&CK TTPs, and attribute them to specific APT groups. Finally, AegisNet
proactively neutralizes threats by automatically isolating compromised users via Active Directory.
Features include:
• Privacy-preserving threat detection without the latency of SSL/TLS interception proxies.
• Real-time JA4 network fingerprinting combined with CICFlowMeter and DoHlyzer statistics.
• Multi-layered Al pipeline for granular attack classification and MITRE TTP mapping.
• Unsupervised learning for behavioral baselining to drastically reduce false positives.
Technology Used:
Python,Pytorch,TensorFlow,Docker,Linux,AWS
Supervisor Name:
Dr. Muhammad Asim
Grou Members:
Abdul Hadi (i22 - 1693)
Malik Ameer Hamza (i22 -1570)
Saad Umar (i22 - 1736)
FAST NUCES ISLAMABAD CAMPUS

SmartBehaviour - Al Driven Malware Sand boxing and Adaptive DFIR
An Al-driven malware sandboxing and adaptive DFIR system is being developed to improve organizational
cybersecurity by automatically detecting, analyzing, and responding to malicious files. The system works by
monitoring endpoint files and safely sending suspicious files such as PDF, DOCX, XLSX, ZIP, and EXE into a
sandbox environment for secure execution and behavior analysis. It has two main perspectives: Endpoint
Monitoring Side .:ind An.:ilyst D.:ishboard Side. The former is responsible for detecting incoming files on
employee systems and forwarding them to the sandbox without executing them locally, while the latter is
for security analysts to review Al predictions, confidence scores, behavioral evidence, and incident response
actions. The system uses anomaly detection Al to identify unusual behavior and classification Al to classify
malware into families such as Ransomware, Worm, Virus, Spyware, and Adware. If the threat is confirmed,
the system can trigger automated response actions such as isolating the endpoint, deleting malicious files,
and blocking harmful IPs or domains. Analysts can also provide feedback through the dashboard, allowing
the system to continuously improve its accuracy over time.
Features include:
• Real-time endpoint file monitoring for PDF, DOCX, XLSX, ZIP, and EXE files
• Secure malware execution and behavior capture using Cape Sandbox
• Al-based anomaly detection for identifying suspicious file behavior
• Mal ware family classification using machine learning models
• Analyst dashboard showing verdicts, evidence, confidence scores, and timelines
• Automated incident response including endpoint isolation, file deletion, and IP/domain blocking
• Continuous feedback and learning to improve Al performance over time
Key Words: Malware Analysis, Sandbox, DFIR, Anomaly & Classification Detection, Incident Response
SMARTBEHAVIOR
Al Driven M elware Sandboxlng and Adaptive DFIR
Technology Used:
Reactjs, Flask, Python, Docker, Cape Sandbox,
Ansible
H aman.llehavlour
A-=--=--
O: b;;d.---=""=::...=-=·:'------'..._-<. Supervisor Name:
~-•--f9"~"t Dr. Qaisar Shafi
to.A.1..Wt,. ....
0 Group Members:
Komal Zahra (i22 - 1613)
Wania Sajid (i22 - 1691)
WHAT W E O FFER
Seam le.. ndpolnt l=lle Survellh,nc.e
Hamna Alam (i22 - 1650)
,O 1ao1at.ed Sanc:n,o.x & Dynamic Bet'lavtoral
ln~elllg•n~ Anomaly D•~•ctlon
<1!J> Al
-
---~
FAST NUCES ISLAMABAD CAMPUS

TriEdge
Al-Powered Adaptive Alert Triage & Contextual Response Engine (TriEdge) is developed to enhance
SOC operations by automating alert triage, prioritization, and response recommendations. It provides
an Analyst View for real-time incident analysis with ML-based severity prediction, LLM-generated
summaries, MITRE ATT&CK mapping, and feedback submission, along with a Management View for
performance and alert trend monitoring. The system integrates with Wazuh and enriches alerts using
threat intelligence feeds (Vulners, OpenCTI, CISA KEV). It combines rule-based noise reduction,
graph-based correlation, and ML models for intelligent prioritization.
Features include:
• Automated alert ingestion and noise reduction
• Incident correlation and severity prediction
• LLM-based incident summarization • Threat intelligence enrichment
• SOC dashboard with feedback loop
• Automated response recommendations
Key Words: SOC Automation, Machine Learning, LLM, Threat Intelligence, Incident Response
OUR SOLUTION
Al-Dr vcn I lybdd SOC AutOrnc)tlon Cnglnc th.Jt:
• Pre-filrpr=. fnte.e no-=.1Tl'VP5
- Correllltcs ate ns nto 1nctdents
• Predic::ts s:ave,.ity using ML
• Generates LLM-baseo surnm.ar1es
- PtUVH.h:~ or HJ l~ku:. O(..l.1(.,HI I ~(,..C,HIUll-.!'IU;Jdlll(.,)11>
ARCHITECTURE KEV FEATURES Technology Used:
DAT A SOURCES • Gr..,ph~b.-~u~d Cnrr&lad.on:
Links related .olcrts into u Python (FastAPI), NodeJS, PostgreSQL,
~•ngle lnclc:Jent v!'lns
r~lett.lo•1~t1lp tnHppln1::,. Neo4j,scikit-learn/XGBoost, and
• Dynamic Risk scorlna:
Adjui.:t..s aolef'"l p.-lorhy boil-to:ed
on i'SS4't vatue. exploit SecurityLLM/LLaMA 3.1.
.ava1l.ab1t,cy, and lhro.ar.
PROCESSING coni:~xt.
• Thre.-c: In~•• Fusion: Supervisor Name:
Enri<;hP~ alcrrs \Nirh P.xrernal
thr-o..lt incolligonco from
Vulncrs, OpenCTI, and CISA
KEV. Dr. Muhammad Asim
• Analyst fi'eedtHIIICk Loop:
Lo.iirns: tr-om .:.n.iilyst.
ORCHESTRATION decisions t.o conllnuou~ly
imprO\/e ML p.-edictlons. Group Members:
• AutoFTiatlun Hook.'!ii:
Trlccers ~utomated
n:!Sponse act:ions lhrough
APls ,.-nc1 SOAR in1ecre1tions. Ta Iha Aamir (i22 -1572)
TECHNOLOGIES USED
.- G FastAPI - Q, Adeen llyas (i22 - 1573)
FAST NUCES ISLAMABAD CAMPUS

MALeficent
MALeficent is an Al-driven multi-modal framework developed to unify malware detection and
payload-aware steganalysis. While traditional methods often struggle with obfuscated threats,
this system bridges the gap between simple detection and actionable threat intelligence.
The frontend of this application consists of three primary modules: Malware Classification,
Steganalysis, and the Dataset Gallery. The first allows users to upload malware binaries, which
the system converts into RGB images, or directly upload images to classify them into specific
malware families. The second provides a deep analysis of images to detect hidden steganographic
content, identifying both the payload type and its potential maliciousness. The third serves as an
informational hub for the custom GAN-based synthetic datasets created to train these models.
Features include:
• Malware Classification and Conversion: Converts malware binaries into RGB images to
capture structural patterns for classification.
• Payload-Aware Steganalysis: Detects hidden content in images and identifies whether the
embedded payload is text or another image.
• Malicious Payload Assessment: Analyzes extracted payloads to determine if they are
benign or malicious.
• GAN-Based Dataset Generation: Addresses data scarcity through synthetic text-in-image
and image-in-image steganography samples.
Key Words
1. Deep Steganographic Detection
2. Embedded Payload Classification
3. Binary-to-Image Malware Representation
4. Steganography Payload Classification
5. GAN-Driven Security Dataset Engineering
•
MALeficent
HI N
ly>'5-r--•-•-----,..--
~ ,..~--........... ~--wMIMaaa..-.1 .................. ...--.w
... .......,., ...... ..., .. ...................... ef~
Technology Used:
Python, Flask, TensorFlow, Generative
Adversarial Networks (GANs), CNNs
Supervisor Name:
- -- - Ms. Sadia Saad
.....
.....,.IOI, . .... Group Members:
Hoorya Muhammad (i22 - 1644)
TECH pa Im\ Hurmain Fatima (i22 - 7438)
STACK Q)
H...m..in F~:. . .., 22i-7438 Supervuor: Ms. :,odia Saad
Hooryo Muhommod 22i-1 f>.4A
FAST NUCES ISLAMABAD CAMPUS

SafeCharge - Securing EV Charging Protocols
SafeCharge: Analysis and Defense of EV Charging Protocols
The SafeCharge project is a comprehensive research and development study focused on the
cybersecurity of the Open Charge Point Protocol (OCPP), specifically targeting its latest iteration,
version 2.1. The project builds upon the established EmuOCPP framework to conduct empirical,
emulation-based security assessments that evaluate how well newer protocol standards mitigate
known vulnerabilities. By transitioning from a theoretical analysis of precursor versions (1.6 and
2.0.1) to an active experimental phase involving the implementation of the OCPP 2.1 specification,
the study identifies residual risks and develops actionable defense strategies for the global EV
charging ecosystem.
Features include:
Multi-Version Protocol Analysis: Systematic comparison of security mechanisms across OCPP
versions 2.0.1, and 2.1 to track the evolution of protocol resilience.
Enhanced EmuOCPP Framework: Extension of the base emulation environment to support the
structural and behavioral modifications introduced in OCPP 2.1, such as improved certificate
management and updated authorization flows.
Adversarial Attack Simulation: Replication and verification of novel attack vectors, including Man-
in-the-Middle (MitM), Security Profile Downgrading, and Charge Station Impersonation (11/12).
Mitigation Strategy Formulation: Development of evidence-backed security guidelines and
hardening recommendations for vendors and network operators.
Key Words:
OCPP 2.1
Network Emulation
Man-in-the-Middle
Cybersecurity Testing Framework
Protocol Analysis
Technology Used:
OCPP, Python, SQLite, Wireshark, YAML
Supervisor Name:
Problem Statement
Dr. Zafar Iqbal
• Rapid Growth of EV Charging Infrastructure
Group Members:
• Increasing Complexity of Charging Networtcs ~la~~~,12:!
·VulnorablUUes In Central Management Systems (CSMSI Jibran Hanan (i22-1732)
• Risk or Input Manipulation & Cvber Alt.ac:ks
Kumail Haider (i22 -1723)
• Need for Roat-time Monitoring & Anomaly Detocl1on
• Adnan Khaliq (i22 - 2529)
L Emulator with OCPP 2.:1. Protocol
2.Att.ack Simulation
3.Testlng Mitigation Strategies
4.Research & Training
Results ·
DoS
FAST NUCES ISLAMABAD CAMPUS

TYPHON
TYPHON is a controlled, research-oriented framework designed to study modern malware evasion
techniques without generating harmful binaries. The system accepts C++ source code and
automatically transforms it into obfuscated and evasive code while preserving functionality,
simulating techniques commonly used by advanced persistent threats (APTs) to bypass traditional
antivirus (AV) and endpoint detection and response (EDR) systems.
It integrates five core modules: code parsing, selectable obfuscation (e.g., variable encryption,
garbage code insertion, control-flow flattening), runtime evasion techniques (e.g., API unhooking,
metamorphism, sandbox detection), a Tree2Tree VAE-based machine learning model that
intelligently selects optimal transformation strategies, and a user-friendly GUI for managing the
process. The tool outputs only transformed source code, ensuring ethical and safe experimentation.
TYPHON bridges theoretical malware research and practical cybersecurity training, enabling Red
Teams, Blue Teams, and academic researchers to analyse and understand real-world evasion
strategies inspired by sophisticated threat actors in a responsible environment.
Group M•ff'm•.-. : Supervlaor :
Muh&>rnrnud (ol.Pi-16.lll) Mr. J,g....,gd l-•hHllCU~.-.
Zut 1uil.J Al" 111:1Ll Mww, (eei-17US)
ze,b Un N11se (221-17S5}
Technology Used:
C/C++, Python, VS Code, Machine Learning,
Code Analysis, GitHub
Supervisor Name:
Mr. Jawad Hassan Nisar
Group Members:
Muhammad Daiyyan (i22 - 1624)
Zohaib Ahmad Meer (i22 -1745)
Zaib Un Nisa (i22 -1756)
FAST NUCES ISLAMABAD CAMPUS

Nexa Aegis: Al-driven Forensics System to detect and analyze Child
Sexual Abuse Material (CSAM)
An integrated Al-powered digital forensics platform is being developed to assist law enforcement
and investigation agencies in detecting and analyzing Child Sexual Abuse Material (CSAM). The
system combines artificial intelligence with digital forensic techniques to automate the
identification of suspicious content and support faster investigations.
The platform analyzes digital images and videos using Al models for explicit content detection and
age estimation. It also extracts and examines metadata to help build a more complete criminal
profile. An investigator dashboard is provided to manage cases, review flagged content, assess risk
scores, and monitor analysis results in an organized and efficient manner.
Features include:
-Al-based CSAM detection
-Age estimation of individuals in digital content
-Metadata extraction and criminal profile building
-Risk scoring and content classification
-Investigator dashboard for case management and review
Key Words: Artificial Intelligence, Digital Forensics, CSAM Detection, Age Estimation, Criminal Profiling
Technology Used:
Python, TensorFlow, Pytorch, ADB, MongoDB,
OpenCV
Su ervisor Name:
Dr. Qaiser Shafi
Group Members:
Maryam Amjad (i22 - 1924)
Amna Nadeem (i22 - 1593)
Dur-e-shahwar (i22 - 1579)
FAST NUCES ISLAMABAD CAMPUS

|     | tradlA- | Al-Powered Cryptocurrency Trading Assistant  |     |     |
| --- | ------- | -------------------------------------------- | --- | --- |
An Al-powered crypto trading system is being developed to assist retail traders in volatile markets.
The platform provides a unified Trader View through which traders can monitor real-time market
data, receive buy/sell signals generated using ICT (Inner Circle Trader) and Smart Money Concepts
methodologies,  and  execute  trades  manually or  through  automated  execution.  Traders  can
configure parameters such as risk level, stop-loss, take-profit, and exposure limits, run backtests to
evaluate strategy performance before enabling live trading, and track live Pnl and performance
metrics. The system includes built-in risk controls to protect against abnormal market conditions.
Features Include:
•  Al-based detection of trading structures (FVGs, liquidity zones, order blocks)
•  Multi-timeframe feature engineering
•  Real-time signal generation (Buy/Sell) with confidence scores
•  Backtesting engine with performance metrics (Win Rate, Drawdown, Profit Factor)
•  Automated trade execution through exchange APls
•  Position sizing and integrated risk management
•  Real-time dashboard for visualization and analytics
Key Words: Artificial Intelligence, Machine Learning, Algorithmic Trading Systems, Financial Time-Series
Modeling, ICT / Smart Money Concepts, Automated Risk Management
From Market Data to Automated Trades: An Al System for Intelligent Crypto
Signal Generation.
---
| ·L A  | Architecture  |     |     |     |
| ----- | ------------- | --- | --- | --- |
_
| 11-~-~  | ill,'  @)  |           | 1111 11m  |     |
| ------- | ---------- | --------- | --------- | --- |
|         |            | ....._    | I-I-  ~   |     |
.... .__
|          | -M<             | --           | •r.o.~  |     |
| -------- | --------------- | ------------ | ------- | --- |
| ....  -- | 0-..~"°"  · · - | - .........  |         |     |
| bNI•~~   | •-t.bdllf~      |              |         |     |
.o,w,.._,.
|     | .....  |                 | - ~Al'fl-.t - |     |
| --- | ------ | --------------- | ------------- | --- |
|     | .,._   | ....l hSda.,t_  |               |     |
• .
i!ll--
ii--
~ lrldtDIUIMM
Technology Used:
•Timel•ine
Python, FastAPI, Scikit-learn, Pandas, Next.js,
,
|     |     | . '  | .  .;   | Typescript, TailwindCSS  |
| --- | --- | ---- | ------- | ------------------------ |
...
|     |     | .           | . .  |                   |
| --- | --- | ----------- | ---- | ----------------- |
|     |     | . ., . ..   |      | Supervisor Name:  |
"  '
Mr. Shoaib Saleem Khattak
| Sep- Oct  | Oct-Dec  | Jan -Feb  | March -April  |     |
| --------- | -------- | --------- | ------------- | --- |
Group Members:
Tools
Tehreem Zafar (i22 -1630)
| Team                      |     |                          | Supervisor:  |     |
| ------------------------- | --- | ------------------------ | ------------ | --- |
| 7)fi1'.1l"'hr=>f>M7cifrH  |     | M, Stl..dLSdlee1 ~tata~  |              |     |
Umar Murtaza (i22 -7431)
;;r. .. ~1 Jrna, Murta?"I
"/1 t54/ :-i-to('U lat ,,hall
Saadullah Khan (i22 - 1647)

FAST NUCES ISLAMABAD CAMPUS

Warden box
Wardenbox is an open source, Al-driven Intrusion Detection System (IDS) with an integrated SemilPS
module, primarily designed to secure web applications running in Docker containerized
environments. Operating on a log-centric approach, Wardenbox collects and parses logs from
running containers, normalizes them into structured JSON, and indexes them in Elasticsearch for
real-time Al-based analysis.
The system's Al Detection Engine uses machine learning to analyze structured logs in real time,
identifying malicious activity across 10 attack types spanning 5 OWASP Top 10 2021 categories. Upon
detection, the Semi-lPS module automatically blocks malicious IPs or applies rate limiting, while
OSINT threat intelligence feeds further enrich detection accuracy.
A unified web dashboard built with React and Streamlit provides real-time log visualization, severity
based alert management, multitenancy support, and downloadable PDF compliance reports. Alerts
are pushed via Slack webhooks or Gmail SMTP. The system is lightweight, scalable, and requires no
manual rule writing; bridging the gap between enterprise grade security tools and the needs of
modern cloud native environments.
Keywords: Intrusion Detection System, Machine Learning, Docker Security, OWASP, Threat
Intelligence, Log Analysis, Semi-lPS, Elasticsearch.
WARDENBOX
Al-Powered Intrusion Detection System
WardenBox is an Al-driven Intrusion Detection System securing
Docker based web applications through reel time log analysis. It
detects 10 attack types across 5 OWASP Top 10 categories.
Technology Used:
Python, FastAPI, Elasticsearch, Docker, React,
Streamlit, Kibana, Machine Learning Libraries,
• F.ntl'rprisc Security
• Con1ainer Monitoring OSINT Threat Feeds, Gmail SMTP
• SMEs & Acodemio.
- • Compliance and Audit Supervisor Name:
_ Mr. Mehmood ul Hassan
.. ...... > J S A o d - k l . ! 1 t H e 1 c l t ~ d 'll S o o. y n 03 a ~ ! t . e /1 l 1 l 1 'I ~ n,i,c,.,,, w _ ll . , n w , l !1 o lJ i , - ~ U 1 9 . - . . < e n l . ~ , i 1 n "" , g n '1 . , ' ; , . .,.1,,;,,, Group Members:
ua.1:11t:mar 11.ras l.11 1665 Bakhtawar llyas (i22 - 1665)
\1.mm• SllPh,ad :UI 1571
SUPERVISOR:
Yumna Shahzad (i22 - 1571)
\Ir. \\lci.1mootl u.111assa1,
FAST NUCES ISLAMABAD CAMPUS

AEGIS LIGHT
Aegis Light is an R&D project focused on developing a lightweight framework for secure communication
between resource-constrained loT devices, particularly those used in modern battlefield environments
such as UAVs. Instead of relying on the traditional and resource-intensive TLS security stack, the system
employs state-of-the-art ciphers and protocols specifically designed for constrained environments.
The framework uses:
-Ascon cipher for encryption (NIST SP 800-232)
- EDHOC protocol for authenticated key exchange (RFC 9528)
-OSCO RE framework to ensure end-to-end secure communication between devices (RFC 8613)
Another key focus of the project is provable security. The SAPIC+ tool is used to formally verify the security
claims of the protocols. Implementation and evaluation are performed using the Cooja simulator running
Contiki OS on each mote. Different network topologies are experimented with to simulate communication
scenarios in a battlefield environment.
Key metrics reported include RAM/ROM footprint, CPU utilization, and handshake latency.
Features include:
-Authenticated Key Establishment: Nodes establish a shared secret using an ephemeral Diffie-Hellman
exchange and verify each other's identities.
- End-to-End Secure Communication: Ensures the confidentiality, integrity, and authenticity of data from
sender to receiver.
- Forward Secrecy: Compromise of a device's signing key or static Diffie-Hellman key does not allow an
attacker to recover past session keys.
Technology Used:
C, Contiki OS, cooja simulator, Tamarin,
AEGIS LIGHT -
Proverif
PROBLEM STATEMENT
-~~~•TOO
•..»"I'.. ........ & on:-.-ui Supervisor Name:
PROPOSED SOLUTION
Mr. Jawad Hassan Nisar
H:lltUOMTWaaM'TMln'DCHot.MCW
•~ ICR~ffD~
• - f'CMec,,-To-G«)~
Group Members:
ARCHITECTURAL DIAGRAM
Muhammad Abdullah Khan Saadi (i22 -1652)
Muhammad Ali Jauhar (i22 -1705)
Syed Muhammad Fateh Kirmani (i22 -1590)
TOOL & TECHNOLOGIES
FAST NUCES ISLAMABAD CAMPUS

Al-Assisted SOAR Framework for Multi-Threat Detection, Triage, and
Automated Response
An Al-powered Security Orchestration, Automation and Response (SOAR) framework is being
developed to address the challenges faced by modern Security Operations Centers (SOCs). The
system integrates machine learning with security automation to enable faster detection of multiple
attack vectors, intelligent triage, and automated response execution with minimal human
intervention. The framework consists of two core modules: the Threat Detection Module, which
employs a Bi-LSTM deep learning model for anomaly detection and pattern matching across SIEM
logs, endpoints, and honeypots; and the Incident Triage and Automated Response Module, which
performs severity scoring and executes predefined playbooks for containment actions such as IP
blocking, file quarantine, and account isolation.
Features include:
• Multi-threat detection (phishing, ransomware, malware)
• Bi-LSTM model for phishing email classification
• Automated incident triage with severity scoring and correlation
• Honeypot (Cowrie) integration to capture novel attack patterns
• Centralized case management in TheHive with MISP threat intelligence enrichment
• Automated file quarantine on Windows endpoints
Key Words: SOAR, SIEM, Machine Learning, Threat Intelligence, Incident Response Automation
Technology Used:
Wazuh, Shuffle, TheHive, Cowrie, MISP,
MailHog, VirusTotal API, Python, Bi-LSTM
Supervisor Name:
Ms. Hina Binte Haq
Group Members:
Muhammad Saad Umar (221-1679)
lmtisal Binte Faisal (221-1660)
FAST NUCES ISLAMABAD CAMPUS

ASTRA[Automated SOC Triage and Response Assistant]
ASTRA is a cybersecurity monitoring and automated incident triage system designed to detect,
analyze, and manage security threats in real time. The project integrates SIEM and SOAR
technologies to create a centralized Security Operations Center (SOC) environment with minimal
manual intervention. The system collects and monitors endpoint logs using Wazuh. These logs are
processed and stored in the Elastic Stack, where Elasticsearch handles indexing and storage, and
Kibana provides visualization dashboards far monitoring and investigation. ElastAlert2
continuously monitors security events and generates alerts based an predefined rule conditions
(e.g., high-severity events). Alerts are forwarded to Shuffle through webhooks far workflow
orchestration and structured processing.
Afterward, events are sent ta the SOAR platform where they are:
Converted into structured security cases
Enriched with threat intelligence data
Escalated and forwarded to the L2 Analyst/ Incident Response (IR) team for investigation and
manual remediation
The overall workflow follows:
Event Generation Lag Collection (Wazuh) Alert Creation (ElastAlert2) Warkflaw Processing
Case Creation+ Threat Intelligence Enrichment Escalation ta L2 / IR Team.
The system implements core SOC and DFIR practices to provide an efficient and scalable solution
for modern cybersecurity operation.
Keywords: SIEM, SOAR, Wazuh, Security Monitoring, Incident Response
Technology Used:
[Automated SOC Triage and Response Assistant]
Wazuh Manager & Agents, Elasticsearch,
A cybersecurity monitoring and automated incident triage system to
detect anal e and mana e securi threats in real time.
Logstash, Kibana, ElastAlert2, Shuffle, SOAR
ARCHITECTURE
Platform (Automation Engine), Ubuntu,
ENDPOINT
OATA/LOCS
Webhooks, REST APls, JSON, curl
Supervisor Name:
Dr. Qaiser Shafi
Group Members:
lmama Muneeb (i22 - 1640)
Huda Im ran (i22 -1713)
Shifa Zehra Naqvi (i22 -1727)
Illlill.
S TEAM MEMBERS
K
Supervisor Name: Dr. Qalser Shafi
Wuuh Elastic Stack EladA!ert2. Shuffle Co•supervisor: Or. Nabeel Ahmed
<il e A e Croup Members;
lmama t-1unoob (122 • 1640)
Huda lmran (122 -1713)
SOAR Ubuntu W&bheolt~ ~EST Shira Zehra Na vi i22 • 1727
FAST NUCES ISLAMABAD CAMPUS

A Self-Learning Trust-Weighted Multi-Agent Framework for Enhanced
IDS in Healthcare loMT
An Agentic Al Intrusion Detection System is being developed to secure healthcare loMT networks.
The architecture features a Pre-filtration Plane using a Deep Autoencoder to drop benign traffic,
and  a  Multi-Agent Plane  where specialized Al agents concurrently evaluate anomalous flows.
Agent predictions are synthesized via a trust-weighted Bayesian fusion engine. This engine uses a
Human-in-the-Loop (HITL) active learning feedback loop to dynamically adjust agent trust scores,
penalizing misclassifications to quickly adapt against evolving threat patterns.
Features and Results include:
Deep Autoencoder pre-filtration to minimize computational overhead.
Concurrent evaluation via a specialized multi-agent ensemble.
Trust-weighted Bayesian fusion for dynamic risk classification.
Evaluation Accuracy: CIC_loMT (98.56%), CIC_DDoS (97.84%), BoT-loT (94.64%), ToN_loT (88.12%).
Handled  out-of-distribution  drift  on  CIC  IDS  (29.90%)  by  successfully  populating  the  active
-
learning retraining queue.
Key Words: Agentic Al, loMT Security, Deep Autoencoder, Multi-Agent System, Bayesian Fusion.
~J
Team Members
| t:t'  |     |     | /l-°  |     |     |     |     |     |
| ----- | --- | --- | ----- | --- | --- | --- | --- | --- |
• Abdullah Nadeem
i221597@nu.cdu.pk
Ada ptive-1 DS
• Humayun Masood
| overview  |     |     |     | l221749@nu.edu.pk  |     |     |     |     |
| --------- | --- | --- | --- | ------------------ | --- | --- | --- | --- |
• M. Bilal lkram
| An adaptive Al-based  |     |     | Intrusion  |     |     |     |     |     |
| --------------------- | --- | --- | ---------- | --- | --- | --- | --- | --- |
i22l636@nu.edu.pk
| Detection    |     | System        | utilizing  |                   |     |     |     |     |
| ------------ | --- | ------------- | ---------- | ----------------- | --- | --- | --- | --- |
| multi-agent  |     | architecture  |            | with  Supervisor  |     |     |     |     |
dynamic trust based scoring for
Dr. Arshad Islam
real-time threat defence.
Wcoer::kJ  F_low. . I
|     |     |     |     | I   | I   |     |     |     |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
":wu
Signature-Based Filte~ng
|     | Raw Data  |     | 19 (9 Cl'JI  | Kr1ow11 Allc:K;k!> [)(:JLeCltOll  | i.Y%<En 1tine  |     |     |     |
| --- | --------- | --- | ------------ | --------------------------------- | -------------- | --- | --- | --- |
|     |           |     |              | HN<1--.,1.,                       | !;.@-- -ID     |     |     |     |
P•·•fa,.._t>On
|     | 01-..;h~:sLraliu11  |     |       |     | ..  |     |     |     |
| --- | ------------------- | --- | ----- | --- | --- | --- | --- | --- |
|     | '-1..!  tr.n,       |     | --~)  |     | I   |     |     |     |
Technology Used:
|     |     |     | ,,..,,;;;-.,. ;.,,,.  | """'"'""''  | "'' :  |     |     |     |
| --- | --- | --- | --------------------- | ----------- | ------ | --- | --- | --- |
I
~ ;-.lGj. ••"•"•'"•ltTiu•ro, -A(,;;,I  · ~  ~TrustWruc~i,p.,,,1.er:d,-O,,,<.,,y. H,a<1  " • T .,, .  l' CRlaustc•l-f8"enat'!,odn   Python 3.9, LightGBM, XGBoost, Snort, Zeek,
lo asl ' \a a
|     |     | Alerts&.Lq:s            |     |                         |     | Torch (Autoencoder), Scikit-Learn, MCP Server  |     |                   |
| --- | --- | ----------------------- | --- | ----------------------- | --- | ---------------------------------------------- | --- | ----------------- |
|     | I   |                         |     |                         |     | I                                              |     |                   |
|     |     | TrustUpdate~            |     | ~~l~~~'l:~~lf~~~~l::rg  |     | \.-                                            |     |                   |
|     | -   | Re1nforceent, Learning  |     | B--'                    |     |                                                |     | Supervisor Name:  |
.·=c--
|     | Results  |     |     |     |     | _  .. ____  |     |     |
| --- | -------- | --- | --- | --- | --- | ----------- | --- | --- |
.,_,_..,..,. ••r-......• «• ,.,r_5 loT",o<)a C)~~~"•<5  Dr. Arshad Islam
| , ..  |     |      |     |     | _.!,;..!_ _  |      |     |     |
| ----- | --- | ---- | --- | --- | ------------ | ---- | --- | --- |
|       |     | -·   |     |     |              | ...  |     |     |
- ·
| j :     |           |            |     | ...          |              |     |                              | Group Members:  |
| ------- | --------- | ---------- | --- | ------------ | ------------ | --- | ---------------------------- | --------------- |
|         |           |            |     | - ·          |              | -   |                              |                 |
|         | OK-:;;..  | _n_,., --- |     | ,._ .. ,. _  | --.-..-:,._  |     |                              |                 |
| ......  |           |            |     |              |              |     | Abdullah Nadeem (i22 -1597)  |                 |
Tim eline
|     | ---- |     |     | -   |     |     |     |     |
| --- | ---- | --- | --- | --- | --- | --- | --- | --- |
-
|              |          | Nov-Dec        |     |                   | Mar-Apr        |     | Humayun Masood (i22 -1749)  |     |
| ------------ | -------- | -------------- | --- | ----------------- | -------------- | --- | --------------------------- | --- |
|              | Sep-Oct  | • Testing and  |     | J:in-Fcb          | • Testing ond  |     |                             |     |
| • Extensive  |          | Developing     |     | • Snort • Zeek +- | Paper Writing  |     |                             |     |
LitcrQ.turc  Approach2s/  Deep Autoencoder  Bilal lkram (i22 - 1636)
Vl,lth ,nulti·agenl
|     | Review  | Frameworks  |     |     |     |     |     |     |
| --- | ------- | ----------- | --- | --- | --- | --- | --- | --- |
detection

FAST NUCES ISLAMABAD CAMPUS

Phantom Box
PhantomBox is a lightweight, stealthy malware analysis environment designed to close the gap
between traditional sandboxes and modern, hyper-evasive malware. By combining hardware
spoofing, user behavior simulation and a live telemetry dashboard, it encourages malware to reveal
its true behavior while remaining accessible to organizations with limited hardware resources.
Key Features:
- Anti-Evasion Intelligence: Implements hardware spoofing (CPU, registry, device artifacts) and
masks virtualization traces to bypass modern anti-VM checks.
-User Activity Emulation: Simulates realistic system usage, including file history and fake application
activity, to deceive malware that checks for "human" presence.
- Integrated Analysis Dashboard: A built-in interface for real-time monitoring of processes, network
traffic, and file system changes, supporting both static and dynamic analysis tools.
- Resource-Efficient Design: Built on QEMU and TinylO (a lightweight Windows 10 build) to ensure
high performance on standard lab machines.
Key Words: Malware Analysis, Sandbox Evasion, Virtualization (QEMU), Hardware Spoofing, Dynamic
Telemetry
G
PHANTDMBDX
FASl-NUCES
A Stealthy & Resource-Efficient Molware Sandbox designed to deliver
comprQhen,ive malwore onolysls in o $of9, non-dQt&Ctable manner.
ARCHITECTURE
Technology Used:
QEMU, Tiny10 (Windows 10), Python, Yara,
strings and various CU-based static/dynamic
analysis utilities.
August S@ptemMr October
Supervisor Name:
TOOLS OVERVIEW .,_ .. TEAM MEMBERS Dr. Sana Aurangzeb
II St~tic Ahmed Tahir (221-1596)
QEMU
,a
T iny10
~
~
..T.
:,\
o.
A n
o
ai
l
y
s;
s ;5
• MuhomnadArsalan Javed (221-1632) Group Members:
..~D :ytnramlsic f'<>WefSheU • Hafiz Muharrrnad "'1ustafa Zain (221-4948)
Pythonr.::I Scripts • supervisor: Ahmed Tahir (i22 -1596)
Dr. Sana Aurangzeb
Muhammad Arsalan Javed (i22 - 1632)
Hafiz Muhammad Mustafa Zain (i22 -4948)
FAST NUCES ISLAMABAD CAMPUS

PROJECT LOKI
Project Loki is a unified, Al-powered platform designed to combat deepfakes in images, videos, and
audio by providing a comprehensive ecosystem for detection, prevention, and education. The
platform's scope extends beyond simple detection tools, aiming to address the fragmentation of
current solutions by integrating multi-modal Al detection, explainable Al (XAI) and multiple
prevention techniques. It also incorporates a gamified learning hub to raise public awareness. This
holistic approach is intended to provide a robust defense against deepfakes.
Features:
• Multimodal deepfake detection (image, video, audio)
• Prevention Mechanisms Explainable Al visualizations
• Gamified fake-vs-real challenges
• Crowdsourced dataset contribution module
• User performance tracking
• REST API & MCP for external app integration
• Secure file upload and media management
• Responsive web interface
Technology Used:
PyTorch, OpenCV, librosa, FFmpeg, RESTI,
PostgreSQL, React.js, TailwindCSS, torchcam,
LIME, pyC2PA,OpenSSL
Verified Reaults Supervisor Name:
Awareneaa Dataset
Ms. Sadia Saad
Y\•
Pbu411:RMandationa(Sept-Oct} n-a:0-Drniop.oeol{Jau-a&u-]
• • ~~Nlllt.,.tJon. Group Members:
• W.ttrmarklng l!I C2PA embedcl.Dg Ho.TY multl-modaldetectioa f!1 MCP
Muhammad Huzaifa Fayyaz (i22-1692)
Phaae 2: E:np,eemenll ti Viluala[Nav-O!q fbNe Fitlalmdoa ,s~ !IMW'-~
• Ll.Mcunlu.tlillcrq • •~optlaludan,,a:wldocwiMDWioG.
• EitplainabM Al fl Loki ~1)' • dM-« eolllrillul.ion
Abdul Nafay Azam {i22-1765)
FAST NUCES ISLAMABAD CAMPUS

AutoCOM
Organizations implementing ISO 27001:2022 face significant challenges, including time-consuming
manual policy-to-control mapping (40+ hours per assessment), verification of 93 Annex A controls,
inconsistent audit interpretations, high consultancy costs,  and difficulty extracting compliance
evidence from  large  policy documents. To  address this,  our project develops an Al-powered
compliance dashboard that automatically analyzes PDF/DOCX policies, maps them to ISO 27001
controls using a fine-tuned Sentence Transformer model, classifies compliance levels (Compliant,
Partial,  Non-Compliant),  extracts supporting evidence  snippets,  and  provides  real-time  visual
analytics-reducing audit time, improving consistency, and significantly lowering compliance costs.
Features include:
| • Integrated technical |     | + documentation compliance assessment  |     |     |     |
| ---------------------- | --- | -------------------------------------- | --- | --- | --- |
• Automated security scanning (OpenSCAP, Lynis, osquery)
• Direct mapping to ISO/IEC 27001:2022 Annex A controls
• Control-wise compliance classification (Compliant/ Partial/ Non-Compliant)
• Risk-prioritized GRC remediation recommendations
• Real-time compliance dashboard with visual analytics
Key Words: Machine Learning, Compliance, Automation, ISO 27001 controls, scanning
AutoCOM
|     |     | Supervisor.  |     | ~,<,t,l,ll#/t~  |     |
| --- | --- | ------------ | --- | --------------- | --- |
|     |     | Ms. Aneeqa   |     | ..,,-           |     |
Al·Powered ISO 27001:2022 Corr,pUanc:e D1.1hbo1rtt
| A u " n i A : m   it .   a n   A l                                     | • f ' n a h l f f f l   . l u l o m . \ l f / '1   ) M l   7 7 0      | 0 \· , 0 ; > 1  C " " n n fl l i a n c . - Team:             |                               | :/~               | 6    |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------- | ----------------- | ---- |
| A u d ,1 o r   O l! , M p M d                                          | f o r   S M E . I .   I t   o n t e a ; r 1 t . n   t e c h n i       | u l   $ ) ' S U .   .  K E m                                 | a n   F a t im a  ( 2 2 1     | - 16 7 5 )   ?:,  |      |
| a n c i  d a : : L m e n U . t J O                                     | n   a t \i l l y s t t   i n t o   . i   1 1 / 'l l f l l d   p t a t | t o n n ,   r r a . p s   r & in n d l l i ! n A , s J     H | un a i n   R a za  1 2 2 i ·l | 6 1 4 )           | 'It  |
| ,11,.,I)' m •-A mt1"r11h., ~m ,-m,.,.;,..; r.1tt.-<1r~ r,f1W'1,i11w,n  |                                                                       |                                                              |                               | ~.tllWJ'I-.:.,:;  |      |
| re,;omntn<latl<:nl. The ly$tt-m -blu ,;a,rt111U01..$ wnFl,luo<ce       |                                                                       | Munim Tirm.ui (221·7425)                                     |                               |                   |      |
ricn.torin&, ,eou:es .awd t e'fort. .arid deivtn it:'UCllired •'511·
prhol,""1 N'>ll'lpl~,.....,-r,,w,~
Technology Used:
Work Flow
Data Collaction
& Frontend
31
Python 3.12, PyTorch (CUDA 12.x), Sentence
Dataset collection,
frontend dashboard,
architecture dragrams.  Transformers, Sci kit-learn, Flask REST API,
comprehensive testing
Python, React+ Typescript, Vite, Tailwind CSS,
NLP Training  Recharts, NVIDIA RTX 2050 GPU 4GB VRAM
~~def ~~hi1S'b lei~g!~~
|     |     |     | dataset,     |     | Results  |
| --- | --- | --- | ------------ | --- | -------- |
|     |     |     | Integration  |     | with     |
Dashboa,d
Supervisor Name:
Tachnical Scanning
Ms. Aneeqa Khalil
ScaB;~8Pts
|     |     |     |     | inte~ration  | with  |
| --- | --- | --- | --- | ------------ | ----- |
Oasnbo:ird, Reports  Group Members:
storage in Database
Eman Fatima (22i-1675)
Finalization & Testing
model  Hunain Raza (22i-1614)
|     |                        | 08              |     | ReFining           | for           |
| --- | ---------------------- | --------------- | --- | ------------------ | ------------- |
|     | CPC R«ommendat,ont &.  |                 |     | RP.commend;1t1on~  |               |
|     |                        | ~ f t l f ' l 9 |     | F i n a l  D       | e ta i le d   |
Pn."' .v11~k  ., _, ,. .,  o : :. ...i   Abdul Munim (22i-7425)
|     | 1eml'd1.illi:)t1 9udarce llnd d$plllY  |     |     | R e p o rt Gen | e ra ti o n .  |
| --- | -------------------------------------- | --- | --- | -------------- | -------------- |
ws1.Ja ena  fealt...,.•duhboard
Wllh 8'1<P0 t.llbNt QaO analysis
••fY'"<1: .t.urhP,.,(lf".>tonn .>ori
ctora,ge :m f r•baM

FAST NUCES ISLAMABAD CAMPUS

evoX {Evasion Exposed):
Detecting Advanced Malware Evasion and Anti-Analysis Techniques
Modern malware increasingly uses stacked obfuscations such as control flow flattening, encoding,
packing, encryption, and virtualization to evade static analysis and machine learning-based
detection systems. While existing research primarily analyzes single obfuscation techniques or
limited two-layer combinations, real-world malware often applies deeper multi-layer obfuscations
in specific sequences. The project "evoX - Evasion Exposed" is a research-based cybersecurity
solution focused on detecting and classifying advanced malware obfuscation techniques applied in
layers.
The primary objective of this research is to move beyond shallow layering and develop a detection
framework capable of:
• Detecting whether a binary is obfuscated
• Identifying the number of obfuscation layers (up to 4-S)
• Classifying the specific techniques used
• Predicting the exact order in which obfuscations were applied
The proposed system follows a modular pipeline including dataset generation with controlled
layered obfuscations, feature extraction, preprocessing and normalization, and a multi-stage
classification framework. The system is evaluated using accuracy, Fl-score, and sequence-level
prediction performance.
The expected outcome is a robust, order-aware detection model that can analyze an unknown
binary or malware sample and output structured information regarding obfuscation depth and
sequence, thereby assisting malware analysts in understanding deeply concealed code.
Features Include:
• Detection of obfuscated vs clean binaries
• Multi-label classification of obfuscation techniques
• Prediction of obfuscation layer depth (up to 4-S layers)
• Order-aware obfuscation sequence modeling Key Words:
• Malware Obfuscation
• Layered Evasion Techniques
• Structured Sequence Prediction
_/ evoX !Evasion Exposedl: _,...,
Detecting Advanced Malware Evasion & Anti- (~ J
"' Analysis Techniques .. .- ,.. ;,,
Technology Used:
f/f
Challenge !' our SOiution! evoX
:s .::::;.:.::·=~~ Python 3.10, Scikit-learn, CatBoost, XGBoost,
LightGBM, IR2Vec, Tigress Obfuscater, OLLVM,
• Oll~deteetloftlncfeuesbfuchcost. - Ill IF ,
Rizin Disassembler, NumPy, Pandas
Supervisor Name:
Dr. Zafar Iqbal
Co-Supervisor Name:
Dr. Muhammad Asim
Group Members:
Sana Khalid (i19-19SS)
Umar Ahmad (i22-1743)
I brilhim Jamil -2211631 Ibrahim Jamil (i22-1633)
SUp~rvlsor. Dr. Zafar Iqbal
FAST NUCES ISLAMABAD CAMPUS

FortiLM
FortiLM is a security layer for LLMs that protects organizations from jailbreak attacks, unsafe
outputs, and privacy leaks while keeping the user experience of a normal chatbot. It sits between
users and any LLM as middleware: every prompt passes first through a Hybrid Jailbreak Detection
module that screens for adversarial instructions and prompt injections, then through a Privacy
Preserver that detects and masks PII, and finally the LLM's response is evaluated by Output Filter
that flags and sanitizes toxic, biased, or policy violating content. End users see a simple web chat
UI, but behind the scenes FortiLM logs every decision to PostgreSQLand MongoDB, preserving both
the redacted text and the original content for audit and incident analysis.For operators and
researchers, FortiLM provides an Admin Dashboard that visualizes jailbreak attempts, PII
detections, and harmful outputs in real time, and an Explainability module that surfaces why a
decision was made (e.g. which patterns or model signals fired). Adaptive Learning and plugin
support allow the system to continuously improve: admins can review flagged cases, correct labels,
and feed them back into the ML pipeline, while the plugin architecture makes it possible to attach
FortiLM to existing chat apps, university portals, or enterprise tools. The project evolves into a
general purpose "LLM security firewall" with hybrid model plus rules detection, optimized
deployment, and integrations suitable for academic, enterprise, and cloud environments.
Keywords: LLM Security, Hybrid Jailbreak Detection, Privacy Preservation, Toxicity and Bias
Filtering, Explainability, Middleware.
FortiLM
~'""' "'" -~ 0
t " I t.~ <I ...- "" I ) "" , I!,_. •," ,._. <J •• < I t'>,1 '-> y-. ..., • • I " I, •1..., -.
I '1''1"' lnnq, 1ri, Vnd,•lr; tr,,n, •nr1,1 pr>'"'l"'IP' p,,vo y 1,,,-,1,,:r
,., d n "'' ,tp, 11,, , " • t • 'f " • ,I'\ , I , , , " " ,1,
''"" I' .... ll ''" 1 Ir , ,.,.. ., ,H r,v
PROJl!!CT , ,-.
Technology Used:
Python, FastAPI, PostgreSQL, MongoDB,
Next.js, React, Typescript, PyTorch, Hugging
Face Transformers, Regex, Docker, SHAP/LIME
Supervisor Name:
Ms. Hina Binte Haq
Group Members:
Muhammad Ahmed (i22 - 7441)
lrsam Maan (i22 -7435)
Saifullah (i22 - 1312)
FAST NUCES ISLAMABAD CAMPUS

Thick Client Application Penetration Testing Framework (T-CAT)
T-CAT is a modular penetration testing framework being developed specifically for thick client applications.
The  system provides an integrated platform to assess Windows-based Python and .NET thick clients for
security weaknesses. Thick client applications interact with both local resources such as configuration files,
registries, and embedded databases, and remote servers, which increases their attack surface. Existing
tools like IDA Pro,  Ghidra, Burp Suite, OllyDbg, and mitmproxy address specific aspects of testing but
operate separately and require advanced expertise. This creates a fragmented and time-consuming testing
process. T-CAT brings together local storage analysis, static binary inspection, lightweight traffic validation,
and  automated reporting within a single framework. The tool detects plaintext credentials, hardcoded
secrets,  insecure communication channels, weak TLS configurations, and outdated binaries. It generates
structured PDF and HTML reports with CVSS v3.l  severity scoring and non-destructive proof-of-concepts.
The modular design allows future extensions without affecting existing functionality.
Features include:
•  Local storage analysis of configuration files, embedded databases, and registry entries for exposed
sensitive data.
•  Static binary inspection to extract strings, DLL imports, hardcoded secrets, and detect DLL hijacking
risks.
•  Lightweight traffic validation to detect plaintext transmission, weak TLS versions, and insecure
certificates.
•  NSRL hash matching to identify outdated or vulnerable binaries.
•  Automated vulnerability reporting with CVSS v3.1 scoring and embedded evidence.
Key Words: Thick Client Security, Penetration Testing, Static Analysis, Traffic Validation, CVSS v3.1
~•\.!,-..1,,;..,j .
THICK CLIENT APPLICATION PENETRATION
TESTING FRAMEWORK (T-CAT)
lo automate security testing of Windows thick client
applications in a single modular framework
ARCHITECTURE
|     | @   |     | E";,  |
| --- | --- | --- | ----- |
-
L..  L.J'lil
~-
|             | .-..... w--·-  | S f A A_ .M. l" .A I . C L . Y. ll Z. .- .I. ,, A. W       | '-O A C N.e./ M .J t.. ... . .Y ~ ...U J I A C   I  |
| ----------- | -------------- | ---------------------------------------------------------- | --------------------------------------------------- |
| T..-..AfGU  |                | c .   ,  y                                                 | o . t ~ .  ,                                        |
| (USf.lt~    |                | ...,..,M'!q,                                               |                                                     |
[r
|     |                     |     | (i):!~ &'I                                                 |
| --- | ------------------- | --- | ---------------------------------------------------------- |
|     | REPOS::TINCMO:>UU.  |     | J,l T ;TW .'". C .."M _ I-K .". 1 .". 1 , ! .'A . _ ~   C  |
O U T P U T
f le iU L T : 5  C......." ' l " 7 " flf ' T " M " L   lltfl«t•  "'n-s·~,r.-.. . . .. , .  .._.  Technology Used:
Tl MELINE
Python 3.9, Tkinter/CustomTkinter, Pefile &
| • Core Engine  | • StuticB-n:uy  | • Load Storage  | • Nctv.·ork Traffic  |
| -------------- | --------------- | --------------- | -------------------- |
ilSpy, Scapy & PyShark
| • GI.JI fo11nl'Vl1inn  | (P.rtFnrh!d r,h~~-,j  | (~tPnt1M r,hl¥:e)  | (p11•M'1f'<tph:1._..,)  |
| ---------------------- | --------------------- | ------------------ | ----------------------- |
| • Stat c Binary        | • LDcal Storage       | • NetworkTra"flc   | • Repcnlrg              |
(i-,ittal p~.¼C)  IV(initbl ph,-11~.:,c)  (i.nitid pha:;.c)  o• lntcg:rs1 tion ond  Su  ervisor Name:
P:"lli,.hinf
Sept· Oct  Nov-Dec  .. an -Fco  March -April  Mr. Mehmood UI Hasan
IQQ.!.S
Group Members:
,tj
M1crmofr  Aneeqa Mehboob (i22-7446)
.NET
|     | ,ca.,  | •   |     |
| --- | ------ | --- | --- |
Fatima Babar (i22-1565)
| Team:                   |     |     | Supervisor:          |
| ----------------------- | --- | --- | -------------------- |
| 1227446 Areeca Mehboob  |     |     | Mr Mehmooc Ul Hasan  |
1221565 rat1ma [Jabar  Co-Supervisor.  Zujajah Usman (i22-1733)
| 1221733 Zu,aJah Usman  |     |     | Ms tJaveer Klra11  |
| ---------------------- | --- | --- | ------------------ |

FAST NUCES ISLAMABAD CAMPUS

Autolead Al
Auto Lead Al is designed for sales agents and managers. The Agent View helps sales staff improve
through call coaching feedback, analyzing conversational metrics like pace, words per minute, and
filler words. Concurrently, the system uses machine learning and keyword filtering to categorize
calls on a percentage scale as a hot lead, cold lead, or spam. The Manager View allows oversight
of these categorized leads and agent performance metrics.
Features include:
•  Percentage-based lead categorization (hot, cold, or spam).
•  Agent call coaching feedback (pace, WPM, and filler words).
•  Spam detection via keyword filtering.
•  Advanced NLP analysis using RoBERTa and BERT.
•  Python-based machine learning architecture.
Key Words: Lead Categorization, Call Analytics, NLP, Machine Learning, Python
•
;---:.,;,.._ r
To .analy20,coach  """'
|     | AUTGLEADA  | I   | :.!::~2!ot.  |
| --- | ---------- | --- | ------------ |
j
1
cotCI or spam IHCI$'
SCOpe:
'-..  usr"g adv11nced Al  .)
• A"'4mtltd lofoj(j c,1eio1llallOnCttOI, Cold,Spaml
• C.UCotdtll'lf:(Mdbol,c, fcrAcW1t1tl)IC<I. WPM,ioer~s)
| • $i><,t,1 0.1e~110,, .A~ l(t.Y'•~  | fill"'"''  |     |     |
| ----------------------------------- | ---------- | --- | --- |
• M•••'¢•<Hlil> ~~y.~..,.i!'\&MNllbilncJ &Cll'I'
• PylhOn 8A$11<1 M~ ar"'i19eu,. .
~ c::.~
Arclitecture Diagram
...w  .- ....................
Technology Used:
Tlmeline:  Python, Bert, Flask, Roberta
| Sept-Oct  | Nc,,v-.Occ  | Jan-Mar  | Apr-May  |
| --------- | ----------- | -------- | -------- |
Supervisor Name:
| , .                     | o  e • 1 1 c o w n 1 1 \ 1  ~                   | D M~  H • • ~ U V • c   | . . a l : l i l   : ; : . . ~ 1 - ' M l                      |
| ----------------------- | ----------------------------------------------- | ----------------------- | ------------------------------------------------------------ |
| 0 . 1 A H 1   C         | U .c : t l on  t. , o n - . - n 4               | , _ . , .  , 1 u e      | t l t \ l   a n d   ., . . . . . _ . . , . .  _ . ,. , .. _  |
| $ t i " " '  f 'l l t t | 1 l n 1                                         |                         | Mr. Arslan Aslam                                             |
| tm p W m e ,            | , t a 1 l o n   . . . . _ d C 1 - - l f l a t e | : :- M ll u t c a f o . |  A p n . . . . .                                             |
|                         | o n r . c o rc t e o e ; d                      | h                       | n . - l l w l l u .  . . . .                                 |
Toots:  Group Members:
Haider Asif (i19 - 1728)
|     | RoBERTa  | \!:lask  | BE.RT  |
| --- | -------- | -------- | ------ |
Aima Asghar (i21 - 2772)
J
| e   |     |     | 6JOID Memb811  |
| --- | --- | --- | -------------- |
,..
Awais Ahmed (i18 -0745)
|     | s~ervlsedBJ:  |     | AWals AlwnedjlSl·074 |
| --- | ------------- | --- | -------------------- |
tialder A•ifU9i·l72t)
Mr.Arslan Aslam
Alma A1,Q111,tf;>ll•,m:>1

FAST NUCES ISLAMABAD CAMPUS

SmartCam Shield
Smartcam Shield is an loT camera security monitoring system that automatically discovers and assesses
vulnerabilities in smart IP cameras on home and office networks. The system utilizes Python Flask backend
with ONVIF protocol, RTSP detection, and network scanning (nmap) to identify connected cameras and test
for security weaknesses including default credentials, insecure open ports (Telnet, FTP), outdated firmware
with known CVEs,  and  internet exposure. A React.js dashboard with Tailwind CSS  provides real-time
visualization  of device status, vulnerability timelines,  and  quantified health  scores (0-100 scale)  with
CRITICAL/HIGH/MEDIUM/LOW risk categorization.
Key features include comprehensive scan history tracking, PDF report generation, Email/SMS alerts via
Twilio integration, camera grouping for multi-device management, and context-aware remediation guidance
for non-technical users. The project successfully demonstrates automated loT security assessment, provides
actionable insights for improving home network security, and delivers a complete end-to-end solution
bridging gap between technical vulnerability detection and user-friendly security management.
Keywords:
loT Security, Network Scanning, Vulnerability Detection, ONVIF Protocol, Smart Home Security, Real-time
Monitoring, Health Scoring Algorithm, Camera Management, Cybersecurity, Automated Risk Assessment,
RTSP Protocol, Remediation Guidance, Alert Management, Dashboard Visualization, Firmware Analysis
| NElWOR1<  | D<VKE      | VULNERABILITY  | FIRMWARE   |     |     |     |     |
| --------- | ---------- | -------------- | ---------- | --- | --- | --- | --- |
| SCANNING  | DISCOVERY  | DETECTION      | ANIJ.YSIS  |     |     |     |     |
1- mmm&B-~l ·
Technology Used:
gg
|     |     |     | __  | Python  3.8+,                                      | Flask,  React.js,  | JavaScript,  | Node.js,  |
| --- | --- | --- | --- | -------------------------------------------------- | ------------------ | ------------ | --------- |
|     |     |     |     | Vite,  Tailwind                                    | CSS,  ONVIF        | Protocol,    | RTSP,     |
|     |     |     | __  | HTTP/HTTPS, JSON, Docker, nmap, Requests library,  |                    |              |           |
.,.
| COMPREHENSIVE  |     |     | M.U..L..T,I -DEVICE  |     |     |     |     |
| -------------- | --- | --- | -------------------- | --- | --- | --- | --- |
S c C '.l" A il' N n"n  H "r. I ,° S _ T ."v O f~ A o V t     CiROUPtNG  Reportlab (PDF generation), Flask-Mail, Twilio, VS
"
Code, Git
Supervisor Name:
DR Subhan Ullah
Group Members:
| N O N • T E C H N | IC A L  r P, Oi aF   R | -E P- O - R ~ T     | E MA JI/S MS  ALE R T S  |     |     |     |     |
| ----------------- | ---------------------- | ------------------- | ------------------------ | --- | --- | --- | --- |
AEM E O IA T I O N  G U ID A NCE  ~ -G "E "N " E "R •A lT r IO : lN n   ·  ~ E ~ ~ f l l   M. Haziq Hussain (i22 -1685)
ldk,,...,..,;t.,.,...,.ti..c.
rffl'Wli11•bl•~
| 4B3iitM!·Bl-id35  |     |     |     |     |     | Ali Virk (i22 -1625)  |     |
| ----------------- | --- | --- | --- | --- | --- | --------------------- | --- |
loTSealdty
Yulrerabiity OetlClion
R e a l- t l m .   M o n i t o f ln g   Uzair Zahid (i22 -1619)
|                          | HN ! t h  S c             | o r i n g  A l g o r it h m  ~ | 0 ~ 1 "" 4 C M 8 8 tS .         |     |     |     |     |
| ------------------------ | ------------------------- | ------------------------------ | ------------------------------- | --- | --- | --- | --- |
| y  ·                     | ~ .  C f t )              | e r S K U 1 l t y   \W         | ,I I V , t -l O tz l !l - dlt+  |     |     |     |     |
| ...... Tlhffi:IOock.-Glt | ""IIO  F'irmwa1e Anafysk  |                                |                                 |     |     |     |     |
| as                       | "'                        |                                |                                 |     |     |     |     |

FAST NUCES ISLAMABAD CAMPUS

Zero Trust Identity and Access Management for Agentic Al
Our system is being developed as a secure multi-agent identity and access management platform,
keeping the perspective of distributed computing environments and enterprise security
requirements. There are two operational layers of this system - Agent Layer and Adm in Control
Layer- the former consists of super agents, sub-agents, and ephemeral agents that perform tasks
across distributed machines, while continuously authenticating using decentralized identities
(DIDs) and verifiable credentials. The latter is managed by the administrator, who controls identity
issuance, policy enforcement, trust evaluation, and real-time monitoring through a centralized
dashboard.
The system ensures that every agent must cryptographically prove its identity before accessing
resources. Authorization decisions are dynamically evaluated using a policy engine based on Zero
Trust principles. In case an agent attempts unauthorized access or exhibits suspicious behavior,
the Host Intrusion Detection System detects anomalies in real time and automatically isolates the
agent using active response mechanisms. If required, the administrator can manually revoke
credentials, update policies, or quarantine the compromised node through the control dashboard.
Features include:
• DID-based authentication and Verifiable Credential issuance for secure agent identity
management and Agent Naming Service for agent discovery.
• Zero Trust dynamic access control using policy evaluation engine.
• Real-time Host Intrusion Detection and monitoring using Wazuh.
• Automatic isolation and trust score adjustment upon detection of malicious behavior.
• Centralized ad min dashboard for managing identities, policies, and monitored
endpoints.
Key Words: Zero Trust Architecture, Decentralized Identity (DID), Verifiable Credentials, Host Intrusion
Detection System (HIDS), Multi-Agent Security.
ZTrustID
Zero Trust JAM for Ag-cnlH.
.!
.
.
.
,.1
_
.o .>.
_
-...,
.
1.
.
.
.
o
.
.
.
.,·
, ,
.,.
.
,_
.
._
. .
.(
i
.
,
,
1
l.'.H
. ..
.t.
,
ih
.
.
.
,
.
~)
.,
1
l ,vd
.,
. ....
i r,
.
.l
m
,-l.b
v
.,,l,,
a
.I,•_
n
(r,
d
H~. -
~
.. )1
.
.
.
..
,
,.
.
..,.
,
.1 .
.1 .
~
,
,
.
•.
.
•.
_
-n
,
.
_
.·.
.
r
_
11)
.
. .
,
.
,
.,
.
,
,
..
,
,.
1
..
.,
..
-
..
_
..
,
.
·
.
.
.
.
.
-
.
,
•-
u
.
A
"., "
l-
.'
l
,"
k
.,
Y
". ,,
"
.,
P
.1,
f
1.
l
.,
1
.,.
.
.,
.
.
.
,
.
,.
1
,,
1
,,.
.
..
,
,
n
1,
1
Technology Used:
....... , ...., .. ............... , ..... , ........, , ....... , ... , .., 1. I... '-.lo,. '"' ... , ....... p.-t••"'•" ....
'/:/::~·z,t::tr':','.7:::.:. . , (:.t:a, 1'1H'l) ~ O w r. n S • u r h y h _1 n ,., n ,• .., l Jl L l1 U ,h I Node, React,python, DIDs, VC, Zero Trust,
!',.a,:ul M...,h,_..,..,-.,1 (22'1 Ill~'\) Cu buno•n l:,;c,l lh'!
Mun.,,.,nAII (:.t:21 173•1) l)r. ;,,(1f';1r 1'-lbrll OPA, Wazuh
Objective:
Right Agent Can Access Right Reaour=, at Right Time. Supervisor Name:
Dr. Subhan Ullah
- - Group Members:
,L ! . -- J ~ ]J Mustansir Hussain (i22-1764)
.,=- ir.~~
l! !;--,- -,._o Saad Mehmood (i22-1655)
' --e--=-
Muazam Ali (i22-1734)
----
....,__
-==--
Tools and 'l'c>(.":hnol.o:Ja(l:e s:
<f\,., 'W3S,..
"•de- ~1 It.• ~ dock~r
e
• mo>•go f'2:i Grol< [•.so•9 WOZUh.
FAST NUCES ISLAMABAD CAMPUS

NetSec
The NetSec Toolkit is being developed from the perspective of cybersecurity professionals,
penetration testers, and network administrators to streamline defensive security operations.
Operating as a full-stack network automation platform, it features a unified, web-based dashboard
that interfaces with an optimized, concurrent C programming engine. Users can leverage this
architecture to conduct comprehensive network penetration testing, executing high-speed port
scans for target profiling and launching multi-threaded L3/L4 kinetic stress tests, including TCP
SYN, UDP, and ICMP Dos flood attacks. Additionally, the toolkit facilitates automated credential
auditing via SSH and Telnet brute-forcing using custom wordlists, alongside a robust configuration
audit module specifically tailored for Cisco IOS security. This module securely connects to network
devices to evaluate compliance with standard security baselines-such as password policies, VTY
access controls, idle timeouts, and secure SNMPv3 configurations. If a device is found to be
vulnerable, users can initiate one-click automated infrastructure hardening patches directly from
the dashboard to remediate non-compliant devices. Finally, to ensure thorough post-engagement
documentation, the system features dynamic PDF session report generation that meticulously logs
all diagnostic tests, attack statuses, and configuration changes.
supervisor:
NetSec Or Subhan Ullah
Group Members:
Automated Vulnerability Detection Muhammad 221·1612
& Secure Configuration Syed Arham Ahmed 22i-lSS2
Validation Tool For LAN Mohammad Aun 22i•1 668
:-t: Problem Landscape f.1 Proposed System: NetScc
E&qlGii
Open Ports Wed,,. Criedcntials M•:scon,gurations MINfifl\:bWHH
l
Smcill and medium LAN env.-onment!i often H·i·H%f#MMI
remain ..-ulnenble duet:> inseci.xe configurations.
Technologies Used:
cxpor..cd scrvi:c$, ,ve.:ik. .luth~ticat10f'\ ilnd lack
of autofT\:lted continuous valid::ition. \ii
Python, C, Netmiko, Report lab, Flask,
Parrot OS, GNS3, Cisco ISO
Su ervisor Name:
Ched::: configunitions
- I. ,_..... Dr. Subhan Ullah
Group Members:
Genercte risk ba~ed report
Syed Arham Ahmed (22i-1552)
Vulner~bl~ Secure
Network Net"Aork
Devke~ Oev-ce•
Muhammad (22i-1612)
a.
1J Muhammad Azan (22i-1668)
Flask
"rgon2
FAST NUCES ISLAMABAD CAMPUS

Viz AI - Intelligent Query System with Caching
Viz AI is an intelligent Flask-based web application that transforms natural language questions into
SQL queries and executes them against a database. The system leverages RAG (Retrieval-Augmented
Generation) with ChromaDB vector store and Ollama LLM for accurate SQL generation. It features an
advanced query caching system that dramatically improves response times for repeated queries and a
real-time dashboard for monitoring system performance. Features include:
- Natural Language to SQL conversion using RAG and LLM technology with vector-based semantic
search for accurate query generation.
- Intelligent Query Caching system that caches question-SQL-results pipeline with configurable TTL,
providing instant responses for repeated queries and significantly reducing LLM API calls and
database load.
- Real-time Performance Dashboard with live query monitoring, cache hit rate visualization, system
metrics tracking, and interactive data tables for result analysis.
- Automated ETL Pipeline with backup table cleanup, schema change detection, incremental training,
and automatic retraining on database changes.
- Flask-based Web Interface with custom branding and responsive design.
Key Words: Natural Language Processing, SQL Generation, RAG (Retrieval-Augmented Generation),
Query Caching, Flask Web Application
[System Architecture Diagram]
Technology Used:
Python, Flask, ChromaDB,
Ollama, SQLite, Pandas, Plotly,
HTML/CSS/JavaScript, Chart.js
Supervisor Name:
Ms. [Zonera Anjum]
Group Members:
[Muhammad Ahmad] (22i-1929)
[Hamza Sabih] (22i-1948)
[Shahzaib Afzal] (22i-1956)

Tahqiiq Al-Powered Legal Document Analysis Platform
Legal documents are often lengthy and difficult to interpret. Tahqiiq is an Al-powered platform
available on web and mobile that simplifies legal document review by transforming complex legal
texts into clear, actionable insights. Users can upload documents and interact with them through
a conversational chatbot to ask questions about clauses, risks, summaries, and policies in natural
language.
The system combines NLP, Large Language Models (LLMs), and Retrieval-Augmented Generation
(RAG) to generate accurate responses grounded in the uploaded document. A fine-tuned Legal-
BERT model is used to automatically extract and classify key clauses such as Indemnification, Non-
Disclosure, and Liability.
Key Features
• Risk analysis and ambiguity detection in legal documents
• Real-time contract summarization
• Al-powered clause extraction using Legal-BERT(Fine-Tunedon Custom Legal Dataset)
• Interactive chatbot for natural language queries
-
|     |     |     | ..,._  __t  ..  - - |     |     |     |
| --- | --- | --- | ------------------- | --- | --- | --- |
m•:IIIOf
!fl-3M
TAHQIIQ
Al-Powered Legal Document Analyzer
Al insights for legal documents.
| KEY FEATURES &  |     | SYSTEM ARCHITECTURE  |     |     |     |     |
| --------------- | --- | -------------------- | --- | --- | --- | --- |
Technology Used:
| Smart document analysis  |     | (!"'  | .!..  ®  |     |     |     |
| ------------------------ | --- | ----- | -------- | --- | --- | --- |
.!.
l b n r t e e a m ki g :, e in n g l   ly  a n a tr ly ti z t e ie s  s le ,  g c t l d  o o rg c a tn ni t z  c in :o g o   t s e t l r ll u t, c   ture  Python, FastAPI, React, React Native,
| k ey   | a n d | l09W1  | Upload  PrePrOCISS  |     |     |     |
| ------ | ----- | ------ | ------------------- | --- | --- | --- |
fprdetpet proce$$ing and iflSfght generation
|                                  |                                                          |          | ID'                                                     |     | MongoDB,  |     |
| -------------------------------- | -------------------------------------------------------- | -------- | ------------------------------------------------------- | --- | --------- | --- |
| Risk & anomaly detection         |                                                          | ¤l       |                                                         |     |           |     |
| 0  P r o a c ti v e J y   id e n | t i f i e s  IX ) 1 e n b a l  n s te s ,   w lt l'll n  |          |                                                         |     |           |     |
|                                  |                                                          |          | Renc!er Doc  RAG Architecture, Ollama,Fine-Tuned Legal- |     |           |     |
| in c o n s i n s t c m c n t     | s ,   f .n d  u n s u a l  e l a tio n s   f ro m        | Stofage  | AJAna~'sls                                              |     |           |     |
iegartara legal ianowge and potential hat>i1ties.
BERT on Custom Legal Dataset
| -1$  Instant summarization  |     | tel  | 0  6  |     |     |     |
| --------------------------- | --- | ---- | ----- | --- | --- | --- |
P.apidty con<1enzes \IOlffllinous leQal dOCumerts
intoclayforqUCIC f9Ykwsof complex COf'IIIJCIS  Summar/  Feedback  Expon  Supervisor Name:
and legal maerbils.
@  Al-powered clause extraction  Al MODELS & TRAINING  Dr. Shahela Saif
lever&9.es advanced Al models (like legal-BERT)
| ~~':~sc:~~-:,.-~~~ifcatOO, Non-dscmure,  |     | ~ . 8 9 1   9           | 5 ,4. .,.  ~ , - c u .  . . ..u a  |     |                 |     |
| ---------------------------------------- | --- | ----------------------- | ---------------------------------- | --- | --------------- | --- |
|                                          |     |                         | . _ . ,& <M I io !                 |     | Group Members:  |     |
|                                          |     | a .... .  .. . .. ..  _ | ,                                  |     |                 |     |
Interactive legal chatbot
| D.._:i  |     |     |     | Muhammad Abdullah Khan (i22 - |     | 2604)  |
| ------- | --- | --- | --- | ----------------------------- | --- | ------ |
TECHNOLOGY STACK
@  Web-based Dashboard
|                              |     |               |         |     | Aakash ljaz (i22 - | 2606)  |
| ---------------------------- | --- | ------------- | ------- | --- | ------------------ | ------ |
| 0  Export & Reporting Tools  |     | FUTURE SCOPE  |         |     |                    |        |
|                              |     | e             | m  ,.,  |     | Arslan Asad (i22 - | 2654)  |
™"DrlMAPI
|     |     | ....... ,,.,.. ...  u-,i.......,.  | ......  |     |     |     |
| --- | --- | ---------------------------------- | ------- | --- | --- | --- |

FAST NUCES ISLAMABAD CAMPUS

Fear Elimination and Recovery (F.E.A.R)
Virtual Reality Exposure Therapy (VRET) application is being developed to help users overcome
specific phobias, particularly hemophobia and astraphobia. This application is designed to assist
psychologists in treating phobias and help patients cope with their fears in safe environments such
as their homes. It allows users to select their phobia and assess its intensity by filling out a self-
assessment form, after which the application analyzes the responses and recommends an
appropriate starting level. Users can engage in gamified progressive exposure tasks with built-in
escape routes and encouragement prompts. The system also allows psychologists or supervisors to
monitor progress, guide therapy, and adjust exposure levels when needed.
Features include:
• Gradual and gamified exposure to phobic stimuli in VR
• Self-assessment to determine suitable exposure levels
• Real-life scenario simulations for therapy
• Escape routes and calming environments for user comfort
• Ability for psychologists to monitor progress and adjust therapy
Key Words: Virtual Reality, Exposure Therapy, Gamification, Cognitive Behavioral Therapy, Phobia
Management
F.E.A.R
FEAR ELMINIATION AND RECOVERY
TEAM MEMBERS SUPERVISOR
Mavra Mehak Gil) 22i-0798 • rn.-ivnune~ll@gm;ul.com Mr Bilal Hh.llk:I Dar
Kashaf Fatima 221.24.1s -kaahat1a11ma.a1.J~m.an.oom CO-SUPERVlSOR
M Safi ur Rehman 221-2S3'i -ms.aifhurehmannogmaJLoom Ms Zoya t4hboob
Technology Used:
C#, Unity, Blender, Sketchfab, lbisPaint X, Unity
Asset Store, Visual Studio Code
Supervisor Name:
Mr. Bilal Khalid Dar
Group Members:
TIM ELIN E Mavra Mehak Gil (i22 -0798}
..........
Kashaf Fatima (i22 - 2415)
Pol!Mlw\dOpt!lnlUUCll'I
FlNJ Relea111e
M Safi ur Rehman (i22 - 2534)
FAST NUCES ISLAMABAD CAMPUS

SQAlify - Gamified SQA Learning
SQAlify is a desktop application developed with the perspectives of Software Engineering students
and QA novices in mind. There are three specialized realms in this app: Blackbox Nexus, Binary
Hollow, and UX Nova, the former allows students to use the features provided to master Black Box
testing  techniques  like  BVA  and  ECP  through  interactive  puzzles.  The  latter  realms  are  for
visualizing White  Box testing code coverage and performing Usability Audits. Additionally, the
"BuggBoard"  feature  simulates  a  real-world  Kanban  workflow,  enabling  users  to  practice
industry-standard  defect  tracking  and  project  management,  transforming  theoretical  SQA
knowledge into practical, job-ready skills.
Features include:
•  Blackbox Nexus for mastering Equivalence Partitioning and Boundary Value Analysis.
•  Binary Hollow for visualizing code coverage and White Box testing logic.
•  UX Nova for conducting Heuristic Evaluations and Usability Audits.
•  BuggBoard simulation for learning Defect Lifecycle Management and Kanban.
•  Real-time feedback on test case design and reporting standards.
Key Words: Gamification, Software Quality Assurance, Unity 3D, Mini Games, Defect Tracking
S[;)ALIF!::::I
GRCl.JF' memBERS
| Talha Rizwan                      | Ibrah,im,, ,K.a,y. anl             | ZaldMuood                |     |     |     |
| --------------------------------- | ---------------------------------- | ------------------------ | --- | --- | --- |
| 22i-'2$39                         |                                    | 2211793                  |     |     |     |
| worl.t11ha1izwllf1C)1;JT11il.com  | ik.tyilfll workl!'."9fT'lo'.llcom  | zaldmasood144@9m.1~ com  |     |     |     |
| SUF'ERVJ'.SOR                     | CO·SUF'ERVISOR                     |                          |     |     |     |
| Mt. Bilal Khalid Oar              |                                    | Ms. Zoya Mahboob         |     |     |     |
0.6.0
SQAlify is a gamifled puzzle-adventure that teaches Sohware Quality
Assurance (SQA) through play. Explore three worlds and learn testing
concepts like bug detection, input/output validation, boundary analysis,
coverage, and usability.
Technology Used:
Unity Game Engine, C#, Figma, Unity Cloud,
Visual Studio
Supervisor Name:
Mr. Bilal Khalid Dar
| TOOLS 6 TECHNOLOG:IES  |     | TJ:mel.:INE  |     | Group Members:  |     |
| ---------------------- | --- | ------------ | --- | --------------- | --- |
>(I
|     | -   | - -_=-,_-- ----- | Hafiz M. Ibrahim Kayani (i22 - |     | 2686)  |
| --- | --- | ---------------- | ------------------------------ | --- | ------ |
|     |     | - ---            |                                |     |        |
,,,___
| .,0--.- PFigma  |     |     |     |                     |        |
| --------------- | --- | --- | --- | ------------------- | ------ |
|                 |     | -   |     | Talha Rizwan (i22 - | 2539)  |
_____I  ______ I _______!
| !x)unity  |     |     |     | Zaid Masood (i22 -8793)  |     |
| --------- | --- | --- | --- | ------------------------ | --- |

FAST NUCES ISLAMABAD CAMPUS

EchoTales - Al Powered Story telling Platform
EchoTales is an Al-powered interactive storytelling application that transforms user prompts into
immersive, personalized stories enriched with narration, emotions, sound effects, visuals, and
interactive decision-making. The platform combines Natural Language Processing (NLP), Text-to-
Speech (TTS), Image Generation, and Interactive Story Engine to create a unified storytelling
experience for children, young adults, and adults.
The application provides an engaging alternative to traditional books and static audiobooks by
allowing users to co-create stories with Al, choose story paths, customize voices, and visualize
scenes in real-time.
Features include:
Al-based story generation from user prompts, Al-assisted story writing (sentence completion,
grammar & vocabulary help), Audio narration with voice effects (laughs, sarcasm, emotions),
Unique character voices & voice customization, image generation for story visualization,
Interactive story game (multiple choice-based branching storylines), difficulty-based story levels
, Save and resume story functionality, Story rating and review system, Story library and favorites
Key Words:
Artificial Intelligence (Al), Natural Language Processing (NLP), Text-to-Speech (TTS), Interactive
Storytelling, Generative Al
lmmersive Storytelling 1-!lotform
Echo Tales converts user prompts into interactive Al-
generated stories with narration, emotions, and visuals.
BackendAPI
Nooe.-, Exp.• -
Pyll'W)(\fUlk
Database
''"'""
Technology Used:
Python (Al & Backend Logic), JavaScript, React
Native (Frontend), NLP Models, Text-to-Speech
Model, Image Generation Model
•
Supervisor Name:
Mr. Saad Salman
Group Members:
Unzila Anjum (i22 - 2550)
Eshal Omar (i22 - 2402)
Hadia (i22 - 2700)
FAST NUCES ISLAMABAD CAMPUS

| CredAura - | Decentralized Job Search Platform  |     |     |
| ---------- | ---------------------------------- | --- | --- |
CredAura is  a  comprehensive  decentralized  freelancing  platform that combines blockchain technology,
artificial intelligence, and tokenized economics to solve the core issues of centralized marketplaces. The
platform assigns each  user a Dynamic NFT-based professional identity that evolves with achievements,
certifications,  and  milestones  while  remaining  fully  owned  and  portable  by  the  user.  It  integrates a
token-based  economy  with  cryptocurrency  payments  and  smart  contract  escrow  to  ensure  secure,
transparent, and  borderless transactions with  minimal fees. Users can  earn additional income through
staking and reward distribution mechanisms, as well as monetize exclusive content such as guides and
templates beyond traditional project work. Al-powered algorithms enhance job matching and perform skill
gap analysis, recommending courses and  automatically linking verified certifications to DNFT profiles. A
decentralized governance model enables community voting on platform decisions, ensuring transparency,
fairness, and reduced centralized control while creating a sustainable, user-driven digital work ecosystem.
Features include:
•  Dynamic NFT professional profiles with real-time milestone updates
•  Tokenized economy with staking and passive income opportunities
•  Smart contract escrow with instant crypto payments
•  Al-powered job matching and automated skill gap analysis
•  DAO-based decentralized governance system
Key Words: Web3 Innovation, Dynamic NFTs, Decentralized Economy, Al Recruitment, Digital Identity
Ownership
| lmDesce;ntrnalizeEd Frexelafncfngl Elcios•ystvem~  | it.  |     |     |
| -------------------------------------------------- | ---- | --- | --- |
• 0;.-'l"I( ui.re1f1utrorr-1Cc·t ci  • ,•1ook $-.:I
• Pr,i 1t-1" [) 'I;' 11t 11qt r.,,..,.; • "'u ~,t,t.• J1 q
SOLUTION
----®--:Y
I
/ Freelancer\
|            |                     | Technolog  | Used:  |
| ---------- | ------------------- | ---------- | ------ |
| DvnamcNFT  | VCf flCd(;c..11:;c  |            |        |
| Pro',ie    | Ccrtdcatoos         |            |        |
Solidity, Polygon, Python, React.js, Node.js,
DAO Govern3110e  Skil gap~ AJ  Web3.'s, IPFS, MetaMask, Remix IDE
Supervisor Name:
MARKETPLACE
| /  ~®  | '\  | Dr. Uzma Mehar  |     |
| ------ | --- | --------------- | --- |
@e
|     |     | Grou  Members:  |     |
| --- | --- | --------------- | --- |
Cryp-;;;P-a;;,...._,  ' Ai.a
|             | Al f'o.ffl«I Job  | Anas Abdullah (i22 - | 2487)  |
| ----------- | ----------------- | -------------------- | ------ |
| & Escro,.Y  | -·  MJtching      |                      |        |
Client
|     |                          | Esha Aamir (i22 - | 2473)  |
| --- | ------------------------ | ----------------- | ------ |
|     | Naufil Bin Nadeem (i22 - |                   | 2492)  |

FAST NUCES ISLAMABAD CAMPUS

Operation Black Haven (OBH)
Operation Black Haven is a 3D VR FPS narrative-driven game that incorporates cybersecurity
concepts through immersive and interactive gameplay across three global missions. Each mission
embeds different cybersecurity tasks directly into the player's actions, combining stealth, action,
and problem-solving.
Mission 1 includes SQL Injection, virus detection using hashing, and Caesar Cipher decryption.
Mission 2 involves phishing with a RAT payload, fake identity insertion, and brute-force
techniques, while Mission 3 features surveillance looping, AES decryption, and rescuing a friend,
Jason Miller under time pressure.
The game includes adaptive enemy behaviour based on player skill, ensuring balanced and
engaging challenges. Skilled players face more challenging enemies while struggling players
encounter less aggressive enemies.
Key Features:
1. First Person Shooter (FPS) Game
2. 3D Virtual Reality based Game
3. Mission-based narrative gameplay
4. Real-world cybersecurity concepts embedded into interactive tasks
5. Adaptive enemy behavior based on player skill
6. Interactive hacking simulations (e.g., SQL injection, brute force, phishing)
7. Cryptographic puzzles (Caesar Cipher, AES)
Key words: Virtual Reality (VR), First Person Shooter (FPS), Cybersecurity, Adaptive Al, ODA
Technology Used:
C#, Unity, Blender, .Net framework,
Visual Studio, Figma
Su ervisor Name:
Mr. Bilal Khalid Dar
Group Members:
Musfirah Zunnoon (22i-2692)
Noor Fatima (22i-2610)
Fatima Rathore (22i-2631)
FAST NUCES ISLAMABAD CAMPUS

FRESH
FRESH (Fruit Recognition & Export Standardization Hub) is a Smart Drone-Based Al System
developed to improve the quality, grading, and export readiness of Pakistan's major fruits: mango,
guava, orange, and grapefruit. Although Pakistan is among the top fruit-producing countries, a
large percentage of produce fails to meet international export standards due to manual
inspections, delayed disease detection, and lack of environmental monitoring.
This project introduces an Al-powered solution that uses drone imagery (RGB and multispectral),
machine learning models, and weather integration to automate fruit analysis and export
compliance evaluation. The system reduces post-harvest losses, minimizes export rejection rates,
and supports data-driven decision-making for farmers, exporters, and government authorities.
Key features:
• Automated Fruit Detection
• Disease Detection
• Fruit Quality Assessment
• Yield Prediction
• Weather Integration
• Analytics & Reporting
• Al Fruit Assistant (Bilingual)
• Client Applications
Overall, FRESH integrates Al, drone technology, and real-time analytics into a single unified
platform to bridge the gap between local fruit production practices and international export
standards, ultimately strengthening Pakistan's fruit export potential.
FRESH
-
1\ RC'HlTfX'TlJ RE-: -
... 0 '"~
-
~ , El
-
. .
Technology Used:
Timclinl': Next.js, Tailwind CSS, React Native, Expo
--
--- FastAPI, Jupyter Notebook, scikit-learn
l-olorM-
TensorFlow/Keras, PyTorch, YOLOv8, OpenCV,
Supabase (PostgreSQL), OpenWeatherMap API,
-----
Google Maps API, GitHub, Visual Studio
Supervisor Name:
Tcom Mcmctu:rs: Dr. Atif Aftab Ahmad Jillani
~H-~
H.r..Waqa, Group Members:
122269$~aT~r
~By. Hassan Rehman (i22 - 2592)
Dr Ahl Aft.M>AMIMI JIIIMJ
Hafsa Waqar (i22 - 2625)
Shajia Tahir (i22 - 2695)
FAST NUCES ISLAMABAD CAMPUS

lntelliCode Arena
lntelliCode Arena is a unified coding platform designed to bridge the gap between fragmented
learning, practice, and assessment tools. It integrates Al-driven content generation, learning
progression with a personalized recommendation system, and secure evaluation into a single
ecosystem serving competitive programmers, educators, and recruiters
Core Functionality & Modules
Learning Roadmaps: Features an interactive visual map with 30 sequential quests across three
Paths: Programming Fundamentals, Object-Oriented Programming, and DSA
Open Practice Arena: A searchable library of 2,000+ curated problems categorized by difficulty
(Easy, Medium, Hard) and topics. It includes a multi-language editor supporting C++, Python, and
JavaScript with real-time execution via Judge0 with access to a chatbot chat can assist with syntax
and problem understanding
Al-Powered Assessment System: Evaluators can automatically generate unique,coding challenges
based on job descriptions and seniority levels using our RAG based agent. The system ensures
fairness through a timed environment and anti-cheat mechanisms, including tab-switch monitoring
and clipboard tracking
Management Panels:Allows for the creation of custom assessments, real-time session monitoring
using the Evaluator Panel and content management using the ad min panel
Key Words: Large Language Models (LLMs), Secure Code Sandbox, Retrieval-Augmented
Generation (RAG), Full-Stack Development
"1.1• Supa"'l~r: Mr :Z.hee~ S.l'OI
I
Ce>-Supe,,.,1.!IOf' : Or Shahela Salf
.:.;.J Group Mernk n :
.suma1r All M@mor\ 221-2709
Muhammad All 22t-268S
Toho Athcr Aw-.an 221 24'16
INTELLI
Al•Powered Gamftted Codlna & Assessment Platform
--(D
Objectlv~&Gools --------
--@ Deslgn-----------
8r 0-l-
°"· 7 l -..:::::
_
@_~_- Tools and Technology Used:
, ......., udu~ ___
,.-, -
_,
-
React, Express, Supabase, Judge0,
- - - 4.6, Visual Studio
--@ Al & Enaineerln&COre -------
Supervisor Name:
Mr. Zaheer UI Hassan Sani
Group Members:
Sumair Ali (22i-2709)
--@Tools AndTechno1011es ------- Muhammad Ali (22i-2685)
Taha Ather Awan {22i-2416)
INTELLI
FAST NUCES ISLAMABAD CAMPUS

Faultline
Faultline is a 3D desktop-based earthquake preparedness simulator designed to provide practical
disaster response training for everyday users. The system consists of three phases: Audit, Survival,
and Aftermath. During the Audit phase, players explore environments such as homes and
classrooms to identify hazards using an in-game tablet with a checklist, map, and inventory, with
hazards randomly generated through structured JSON data to ensure session variability. The
Survival phase features a realistic earthquake simulation controlled by configurable intensity
parameters, where players perform safety actions like Drop, Cover, and Hold through quick-time
events. In the Aftermath phase, players assist injured NPCs and guide survivors to evacuation
zones, with dynamic scoring and feedback used to assess preparedness levels.
Features include:
• Random hazard spawning using JSON data
• Audit tablet with checklist, map, and inventory
• Realistic earthquake simulation with configurable intensity
• QTE-based survival actions
• NPC rescue and preparedness scoring system
Key Words: Unity, Earthquake Simulation, Game-Based Learning, Disaster Preparedness,
Interactive Training
SUPRERVISOR: DR AHMAD RAZA
FAil UR RAHMAN (221--1771) FATIMA WAJAHAT(221•2•1') "kAlf ANWAR(:t21•2H8)
PRO.:JECT
FAULTtLINE
EARTHQUAKE PREPAREDNESS
THROUCH CAMEPLAV
0--~ A:ditPh:ISC
"\:I @-::::~=
ln,pectandloa,nabout
Unity Blonaor
Gameengine 3D asset
Technology Used:
0
hperience the quake C# Unit Blender Visual Studio
& how to tackle it
C# VlllUIII Studio @ Su ervisor Name:
Scripting GamoScript;ng
Aftermath Phase Dr. Ahmad Raza
Cl-·····/ Treat iniuries and •"acuate
• NPCS Yourself Grou Members:
"' *
Faiz Ur Rehman (22i-8778)
lnteroc:Ovo Go ming Ro\cue& Treating fa.dback "-Sc:<1r• Fatima Wajahat (22i-2413)
4
Kaif Anwar (22i-2668)
N•:v:~:::• Evacuation &
Active Learning surviv(II
FAST NUCES ISLAMABAD CAMPUS

SceneCraftAI 2D Unity Plugin
SceneCraft Al is a Unity-based 2D plugin being developed to automate 2D game scene generation
using Natural Language Processing and Generative Al, whilst keeping the perspective of indie
game developers. The system is trained on four genres such as Jungle, Horror, Dungeon and
Beach. There are four core modules of this plugin
Prompt Processing Module -
Asset Generation Module -
Scene Generation Module -
Game Playability Module
The Prompt Processing Module utilizes BERT for genre detection, keyword extraction and
contextual enhancement from natural language prompts. The Asset Generation Module employs
the FLUX.1 DEV model for high-quality 2D asset generation, utilizing VAST Al as the cloud service
for GPU-intensive generation. The Scene Generation Module handles constraint-based asset
placement within Unity, orchestrates the assembly of individual assets into a complete and
structured game scene. It handles the placement of assets within the Unity environment,
transform-ing a collection of prefabs. Lastly, the Game Playability Module focuses on transforming
the static scene into an interactive and playable experience. It accomplishes this by automatically
applying physics properties, behaviors, and basic control scripts to the objects within the scene. In
case of unsatisfactory asset placement, developers can regenerate individual assets, customize
them by modifying the prompts, with the system maintaining visual consistency throughout.
Key Words:
• Genre-based scene generation (Jungle, Horror, Beach, Dungeon) from natural language
prompts
• Text-to-asset generation using FLUX.1 Dev model via VAST Al cloud service
• Constraint-based asset placement for intelligent scene composition
--
• Automated game playability verification
• Asset customization through prom-p--t- -----......- -----------------
Technology Used:
C#, Python, Unity, BERT finetuned (NLP
Processing), Lora (Low Rank Adaptation
Finetuning Technique), FLUX1.DEV model
(Image generation), VAST Al (Cloud Service)
Supervisor Name:
Ms. Shahela Saif
Group Members:
Ashhar Amir (i22 - 2420)
Aysha Hashmi (i22 -8766)
Khadija Khalid (i22 -2557)
FAST NUCES ISLAMABAD CAMPUS

EduSign
EduSign is an Al-based educational assistant designed to support inclusive classroom learning for
deaf and hard-of-hearing children by enabling two-way communication between students and
teachers using American Sign Language (ASL). Traditional classrooms rely heavily on spoken
instruction, which creates communication barriers for deaf students. EduSign addresses this
challenge by translating student sign language into text or speech for teachers and converting
teacher text or speech into sign language using pre-recorded sign videos. The system focuses on
basic mathematics learning, allowing students to understand instructions and express responses
effectively. EduSign operates as an offline classroom prototype, making it suitable for low-resource
educational environments and promoting equal access to education.
Features Include:
• Sign language to text/speech translation for student communication
• Text/speech to sign language conversion for teacher instructions
• Support for basic mathematics concepts and classroom interaction
• Two-way communication between students and teachers
• Offline operation for controlled classroom environments
Key Words: Artificial Intelligence, Sign Language Recognition, Inclusive Education, Assistive Technology,
Computer Vision, Machine Learning
~~.. FAST NATIONAL
\ I~ ' -ljt UNIVERSITY
OF COMPUTER &
' EMERGING SCIENCES
EduSign
Al-Powered Educational Assistant
for Deaf & Hard-of-Hearing Children
O•WM;\!41:JWI ,. • •
.Al-based classroom assistant l:: - ii,
• Enables two-way communication
• Translates ASL to textJspcech for teac ers
.converts teacher's Input to sign l;.i1nguage
videos for students
• Focuses on basic mathematics learning
Technology Used:
Python, OpenCV, MediaPipe, TensorFlow,
PyTorch, Machine Learning, Computer Vision
Supervisor Name:
Dr. Asif Muhammad Malik
-+--•& PHASE2
PHASE J ASL s'9n ™=09n1Non
D.tlu•t set.ct.on A mod•I CS.velopmant Group Members:
illnd ~procenl119 ______,..
PHASE 3 -+--e0 PHASE 4
Sy•tem lnte,ration Umama Saif (i22 - 2558)
Taxt/'l~h to sign M'ld tHtlng
modul• int~ r•UOn
Aamina Bokhari (i22 - 2474)
TOOLS & TECH
Mahnoor Hafeez (i22 -2549)
FAST NUCES ISLAMABAD CAMPUS

EarlyRay : Al-Powered Cancer Detection & Analysis Tool
EarlyRay is an advanced, Al-driven healthcare platform designed to facilitate the early detection of
cancer, specifically lung cancer and nodules from radiological scans (DICOM CT scan). The system
bridges the gap between Patients, Physicians,  Radiologists and Doctors by providing a unified
portal for medical consultations, real-time communications, secure file sharing, and automated Al
analysis. The core feature are
1. Role-Based Access Control: Distinct permissions for Patient, Doctor, Radiologist and Physician.
2. Al-Powered Diagnostics: Integration of a Python deep-learning model to detect cancerous lung
nodules from radiological DICOM ct scans.
3. Telemedicine Consults: Radiologist consultation and Patient-Doctor appointment scheduling.
|     |     | Instant  messaging  | (chat)  and  | live  notifications  | powered  by  |
| --- | --- | ------------------- | ------------ | -------------------- | ------------ |
4.  Real-time  Communication:
Socket.io.
5. Medical History Management: Secure storage and access to patient records and scan reports.
6. Report Generation: Downloadable PDF reports with diagnostics, clinical data, and scan visuals.
Technology Used:
MERN Stack (Mongodb, Express, React,
Node.js), Github, Trello, Figma, Socket.io,
Redis, Nodemailer, Python, TensorFlow,
WORKFLOW
Flask, OpenCV & Pillow, Scikit-Learn,
FastAPI, Illustrator, Vercel.
Supervisor Name:
Mr. Bilal Khalid Dar
Grou  Members:
| @@®@@@  |     |     |     | Amna Noor (i22 -1529)  |     |
| ------- | --- | --- | --- | ---------------------- | --- |
Prth011 Mon::icdb J\OOei:.  G·thtt:i ll1JStratO" Over9eaf  Sania Zaheer (i22 -2674)
| @®®®® | ©   |     |     |     |     |
| ----- | --- | --- | --- | --- | --- |
r,.uo  OpenCVT•nGO<"~lcw 1>&3ct  F gm:t  Veeo&l  Malaika Naseer (i22 -1508)
| Presented By:            | Superv1s1on:        |                    |     |     |     |
| ------------------------ | ------------------- | ------------------ | --- | --- | --- |
| Malaika Na5ee  !??15•)8  | Mr 8 1a1 KMIIC Dar  | Ms zova Mahb00b    |     |     |     |
| S;;m/i /;thRfH  [)))HI~  | j;,-,n-~1<.Y        | rl"> S ,r,m111<rr  |     |     |     |
| Anina N:ior  f221:i29    |                     |                    |     |     |     |

FAST NUCES ISLAMABAD CAMPUS

MotionGenVR
MotionGen VR is a Unity Editor extension being developed with the perspective of game developers
and VR designers in mind. The tool has a single primary interface - the Developer View -accessible
directly within the Unity Editor as a custom inspector panel. The Developer View allows users to
select from a range of supported VR interaction mechanics, assign target GameObjects from the
scene hierarchy, configure mechanic-specific parameters, and automatically generate the required
C# scripts along with all necessary Unity components, all without writing a single line of code
manually. In cases where the system cannot auto-detect the correct scene hierarchy or the required
object references, the developer is clearly prompted with actionable error messages and guided to
resolve the issue before generation proceeds.
Features include:
- Object interaction mechanics: grabbing, two-handed grabbing, throwing, and spawning
- Tool-based mechanics: hammer & nail, brush, roller, spray paint, and air writing
- Shooting mechanics: projectile generation, trigger input, manual reload, and haptic recoil
- Physics-based locomotion: ladder climbing and hand push-off jumping
-Auto context detection: identifies scene objects and attaches scripts automatically
- Parameter validation with inline error feedback
e
National University of Computers and Emerging Scienc s
MotionGen VR
I
Supervisor Co-Supervisor
M, Bilal Khahd Dar Ms. Zoya Mahboob
Team Members
mar Meh'Tlood Maryam Khan Emaan Shaikh
? 2617 2212514 22i6764
CnaatQd to automate Unity VR mechanics, reducing code and)
~nual effort to streamline the VR development experienc!J
Process Flow Technology Used:
C#, Unity, XR Interaction Framework, Oculus,
Visual Studio Code
Timeline Supervisor Name:
h:,er.l.l,a_on,J .i". . r . -". •'t .~o . n 4 (F. Mr. Bilal Khalid Dar
(
r"""":'...,."'-'' I----------------<
Group Members:
Tools El Technology Maryam Khan (i22 - 2514)
Umar Mehmood (i22 - 2617)
Emaan Shaikh (i22 - 8764)
FAST NUCES ISLAMABAD CAMPUS

Al-Based Smart Surveillance
SecureVision  is  an  Al-based  smart  surveillance  system  being  developed  while  keeping  the
perspective  of  retail  businesses,  financial  institutions,  and  security  personnel.  The  system
enhances  traditional CCTV  infrastructure by intelligently detecting non-violent yet high-impact
suspicious  activities  such  as  loitering,  shoplifting,  pickpocketing,  cash  skimming,  camera
tampering, and crowd anomalies.
Features include:
Detection of suspicious activities including loitering, shoplifting, camera tampering, and crowd
density anomalies from real time cctv footage.
Al-based agent reasoning for comparing customer behavior with transaction data.
Incident management will acknowledge, confirm, dismiss, and escalate workflow.
Evidence export including video clips, screenshots, and structured reports.
Analytics dashboards showing incident trends, heatmaps, and loss prevention metrics.
Feedback loop for adaptive learning and false positive reduction.
Cross-camera person re-identification for identity-consistent tracking.
Key  Words: Computer Vision,  Deep  Learning, Multi-Object Tracking, Person Re-Identification, Real-Time
Surveill.:ince, Pose Estim.:ition, Loss Prevention Analytics.
|     | SECUREVISION  |     | E)  |     |     |     |
| --- | ------------- | --- | --- | --- | --- | --- |
A smart CCTV-based surve1Iance svsten to detect non-v101en1 crimes In retall stores
Technology Used:
Python, PyTorch, TorchVision, OpenCV,
YOLOvll, Bal-SORT, OSNet (Torchreid),
MediaPipe, R3D-18, FastAPI, PostgreSQL,
Next.js, Node.js, NumPy,
Scikit-learn,TensorFlow Lite
| snopltftlng Detection  | Camera Tampering  | CroW'd Density Flow  | Lolterln~ Detection  |     |                |     |
| ---------------------- | ----------------- | -------------------- | -------------------- | --- | -------------- | --- |
|                        |                   |                      |                      | Su  | ervisor Name:  |     |
Tlmellne:
|     | Nov-Dec  |     | Mar-Apr  |     | Ms. Noor ul Ain  |     |
| --- | -------- | --- | -------- | --- | ---------------- | --- |
MLllll•Cam:r•
Qfr.'TIUUOr\
|     |     |     | 0.p : t : o ,y y , r i r e . m en   t,  |     | Group Members:  |     |
| --- | --- | --- | --------------------------------------- | --- | --------------- | --- |
EvOCllc.t£100f1
| Sept-Oc1  |     | Jan-Feb  |     | M.Abdullah Asif (i22 - |     | 1527)  |
| --------- | --- | -------- | --- | ---------------------- | --- | ------ |
e
| Jaase<,             |     | S"Cil'flJ   |     |     |     |     |
| ------------------- | --- | ----------- | --- | --- | --- | --- |
| f:MN'li~.l":;vn~•A  |     | ~in"mno.AI  |     |     |     |     |
lnbo < j r al" ) ~,   l. > .ic  1<:< 0 > ,.  < . . 1 o   n , ;. w ,.gL ~ ~ " y<   >r,  Syed Musaab Sarni (i22 - 2682)
V 'l ' W / M v L , "
| Tools:  |     | Team Members:  |     |     |     |     |
| ------- | --- | -------------- | --- | --- | --- | --- |
Mira I Hasan (i22 -8753)
| .- ~ O | l'ue  | 2!11•1521 M.~,i;:ul;allAdf  |     |     |     |     |
| ------ | ----- | --------------------------- | --- | --- | --- | --- |
221-:.1&82 "usaibS,mi
| 0 -'r O ti3  | •   | .C'Jl-tl/~::S Mtrlill HHffi  |     |     |     |     |
| ------------ | --- | ---------------------------- | --- | --- | --- | --- |

FAST NUCES ISLAMABAD CAMPUS

Tabeeb: An Al-powered Healthcare Platform
Tabeeb is an Al-powered healthcare platform that is designed to serve administrators, doctors, and
patients through role-based interfaces. The application has two primary user views:  doctor and
patient. Patients can interact through a bilingual voice interface supporting both English and Urdu
to store  medical  records,  check symptoms, manage medications, locate nearby hospitals and
pharmacies,  consult certified doctors, and  receive  emergency first aid  guidance. Doctors can
manage  their schedules  and  payments,  write  prescriptions  and  biogs,  and  conduct  patient
consultations, along with receiving patient feedback. Administrators have access to a web interface
to validate doctor credentials, maintain audit trails and manage user support.
Features include:
Al-based symptom checking, medical guidance, and emergency first aid assistance.
Telemedicine consultations with certified doctors and e-prescription service.
Medication tracking, nearby hospital or pharmacy search, and medical record management.
Bilingual voice interface supporting Urdu and English for better accessibility.
Doctor schedule management, payment gateway integration, and content management.
Doctor credential verification and user support management.
Tabeeb strives to make quality healthcare a right, not a privilege.
Ke words: NLP, Medical Chatbots, Telemedicine, Al in Healthcare, Prescri  tion OCR
An Al•powftf'f!d mobil@ healthcare platfo,md K.gned to Mdge the acceu b1hty gaps by
ofl•1lng mull lin9u11lvok:e and chat~sed conJ1..11tatkln1. symptom cheeking. prelertptlon
Technology Used:
Android Studio, Jupyter Notebook, Python,
OpenCV, Pinecone, LangChain, MERN Stack,
TIMELINE  Whisper, Typescript, FastAPI, Vercel
..... ui""""'~°'
|         | •  I  &J("t_...,...       |                | Supervisor Name:      |     |
| ------- | ------------------------- | -------------- | --------------------- | --- |
|         | 7'  ·--·                  | ·---           |                       |     |
|         | 4'1'>1  ...... .,•  ...,  | ::A>.ilp=l  ~  |                       |     |
|         | ~s-- ~~~.,_               |                | Mr. Bilal Khalid Dar  |     |
| fIWWDt  | .,._.,.,w_..  . • I       | !::...._,,.,,  |                       |     |
•
| '-,,ill  |     | .......  |     |     |
| -------- | --- | -------- | --- | --- |
Group Members:
|     | TOOLS & TECHNOLOGY  | -   |                   |        |
| --- | ------------------- | --- | ----------------- | ------ |
|     | • Cn.u  •           |     | Arwa Ahmed (i22 - | 2676)  |
GROUP MEMBERS
AAWi>,,AHMEO • 221-2,c,7,>  r-.lOORANISHrlAQ •ztl 2010  ZARMEEr-.lA FAtlMA• 221.·1883  Zarmeena Fatima (122 - 7883)
| ru:2'17...,.U[DUM(         | ..U l"Dl;PP.            |     |                       |        |
| -------------------------- | ----------------------- | --- | --------------------- | ------ |
| SUPERVISOR                 | CO-SUPERVISOR           |     |                       |        |
| ,-.R 91LAt.ti:kAl..10 DAR  | 1'1$.ZOY/11. MN-tBOOti  |     |                       |        |
|                            |                         |     | Nooran lshtiaq (i22 - | 2010)  |

FAST NUCES ISLAMABAD CAMPUS

AuTest -Automated App Testing
An automated mobile app testing tool is being built with the perspectives of software development
and QA teams in mind. The developers and testers can upload their app's Play Store ID and APK
file; after which, the system automatically scrapes user reviews, classifies them using an NLP
model, generates structured test cases from the identified issues, and executes them on an
Android emulator. All results, including pass/fail outcomes, screenshots, and logs, are displayed
on a reporting dashboard in a simple and readable format. If the generated test cases do not seem
relevant or the user feels the results are inaccurate, they can flag the issue. The flagged cases can
be reviewed manually to correct or update the test case mappings.
Features include:
• Review scraping and classification, including bug reports, feature requests, usability
issues, and UI complaints sourced directly from the Google Play Store.
• Automated test case generation from classified reviews using a locally hosted LLM.
• UI element detection and test execution on Android emulator using Appium.
• Flagging inaccurate results in the admin panel for manual correction and review.
Keywords: Natural Language Processing, Automated Test Generation, Mobile Application
Testing, User Review Mining, Large Langu,a_ge Models
Or.~lilol
AuTest G-«.e>Mef'1"10e<•
Automated App Testing Muha.m..m.D.,d. U,,.M.,O.n. 2,,2;i-.2,6..l8,
Turning user complaints into automated test Abduhh 1yos 22i-2S12
cases, so you fix what actually matters.
Workflow
~,, @ .&
@ - ~d - ~ - W-
Revlew Sentiment Review Topic
Scrapping Analysis Classification Modelling
l
® - rff<\ - ~ - ~
Technologies Used:
Test Case Test Cases Test Case App Python, React, Node, Flask, Distilbert,
Execution Review Generation Exploration
Qwen3
Key Features
Supervisor Name:
• Scrapes and classifies Play Store reviews automatically.
• Generates test cases using a locally hosted LLM.
Dr. Muhammad Bilal
• Detects UI elements and executes tests via Appium.
• Reports results with screenshots and logs.
• Flag incorrect results for correction. Group Members:
Technologies
Muhammad Usman (22i-2618)
<ffi> ti •de ,,appium DistilBER~ Saoud Ahmed (22i-2467)
Abdullah llyas (22i-2512)
FAST NUCES ISLAMABAD CAMPUS

CyberShieldX
An Al-based browser extension developed to detect and prevent cyberbullying on online
platforms. The extension analyzes webpage content in real time and identifies harmful text and
images using Artificial Intelligence models trained in English and Roman Urdu language. Detected
cyberbullying content is automatically blurred or hidden to ensure a safer online experience. Users
can also submit feedback if incorrect detection occurs in order to support reinforcement learning.
Implementation of xAI for transparency.
Features include:
Real-time cyberbullying detection from text and images
Multilingual support (English & Roman Urdu)
Automatic blurring or hiding of harmful content
User feedback system for incorrect prediction
xAI in order to explain the blurred content
Conversational Analysis in order to separate real cyberbullying & fun banter
Key Words: Artificial Intelligence, Cyberbullying Detection, Natural Language Processing, Computer Vision,
Browser Extension.
Supervisor
Dr Atlf Aftab Ahmed Jllanl
Group M embers
Subhan Ahmed 221-2497
IVlomln Na:zcar 221-249"1
Aqso vaqoob 22i-2501
CVBERSH:::EELDX
An Al-povver-ed br-ovvser extension that
detects
cyberbullying in real time
Objective:
To bulld an Al system that detects and blurs cybel"bullying
content" in rc.-:ll t"imc using tc><t: nnd imngc ;:,n.olysis in English .-:ind
Rom an Urdu. lnLegral.ed vvllh a brovvser ext.enslon and
exr,l"inAble AL
Technology Used:
Phyton, JavaScript, HuggingFace, FastAPI, VS
Code
Su ervisor Name:
Dr Atif Aftab Ahmed Jilani
Group Members:
T::ICME L::IC NE
Tr.-iinlng .-ind Ex«?nsion and Subhan Ahmed (i22 - 2497)
fine-tuninf: models iru;e,crcu;:ion of XAI
Momin Nazar (i22 - 2491)
Context Analysis and
B.ackend Integration Aqsa Yaqoob (i22 - 2501)
TOOLS
••••••
6 0 - •II I
FAST NUCES ISLAMABAD CAMPUS

Clarimo Al
Clarimo Al is an Al-powered platform designed to help aspiring founders validate startup ideas
before investing time and resources in building products. Many early-stage startups fail due to lack
of proper problem validation, market research, and structured planning. Clarimo Al addresses this
challenge by analyzing real-world discussions and market signals to identify genuine problems and
potential opportunities.
The system collects data from online platforms such as Reddit and other startup communities and
processes it using Natural Language Processing techniques. It identifies recurring user pain points,
clusters similar discussions, and evaluates the significance of problems. Based on this analysis, the
platform helps founders validate ideas, analyze competitors, identify target customers, and
generate structured go-to-market strategies.
By combining Al-driven insights with automated market intelligence, Clarimo Al enables founders
to move from idea discovery to a market-ready startup strategy in a structured and data-driven
manner.
Features include:
• Al-based problem discovery from on line discussions
• Startup idea validation using market data
• Competitor analysis and comparison
• Customer segmentation and persona generation
• Automated go-to-market strategy generation
Key Words:
Artificial Intelligence, Natural Language Processing, Startup Validation, Market Intelligence, Data
Analysis.
I FYP Members:
Supervised By:
Maaz Uddin 221-2599
I Dr. Shahela Sail
Hafsa Suleman 221-8752
Platform
From Idea to Markot - Powered by Al
An Al·pOVl.-ered platform that turns raw onhno d,scussiom: into volidolod startup opportun111o-s and markel·rcod}
!.lfOtogies
Key Feature•
Problem Idea Competitor Customer Launch
Discovery Volidotion Discovery Finder A P s la s n is n t i a n n g t St G ra T t M eg y Technology Used:
Python, React.js, FastAPI, HuggingFace
Syslom Flow
Transformers, MongoDB, PRAW (Reddit API),
- - - Goo le Trends API
ClARIMO Al Engine
Supervisor Name:
Dr Shahela Saif
Grou Members:
Maaz Uddin (i22 - 2599)
Hafsa Suleman (i22 -8752)
Tools Used •
0
FAST NUCES ISLAMABAD CAMPUS

Req2Design
Req2Design  is  an  intelligent, semi automated web application  built for software  engineering students,  startup
founders, and SME teams. Users input their software requirements in natural language - either as typed text or audio
recordings - and the system automatically generates standards-compliant documentation. If the generated output is
incomplete or incorrect, users can flag the section for manual review and correction.
Features include:
•  Automated IEEE 830-compliant SRS generation with Functional and Non-Functional Requirements
•  NLP-based ambiguity detection - identifies vague terms like "fast" or "secure" and prompts for clarification
•  Audio input support via OpenAI Whisper API with 95% transcription accuracy
•  Cockburn-template use case generation with actor extraction, preconditions, main flow and postconditions
•  Automated UML 2.x Use Case Diagram generation via PlantUML/Mermaid
•  Full document export in PDF, DOCX, SVG and PNG formats
•  Flagging mechanism to report incorrect outputs for manual correction
•  System dataset updated after flagged queries are resolved
Keywords: Natural Language Processing, IEEE 830 SRS, Requirements Engineering, UML Automation, Large Language
Models
•
Re  q 2 De s1gn SUpervisor. Dr. lsma IJ Hugn
Co-Sup,rviso,:5'-C>Nalsldrees
Ail Rawan (221-2447)
~.
| Al-Powered Automated SRS Generation  | Abdul Haq (221-2585)  |     |     |     |
| ------------------------------------ | --------------------- | --- | --- | --- |
Muhammed stwihme@f (221-1522)
PROBLEM & OBJECTIVES
| Q Problem  |     | IEEE 830 SRS  |     |     |
| ---------- | --- | ------------- | --- | --- |
Mani.Ai SRS creation Is time-consuming
•
| Requirements often lnconsiStent  |     | l   |     |     |
| -------------------------------- | --- | --- | --- | --- |
9
DocumenUldon delays slow development
~ Case
Documentatk>n
_. I
| SYSTEM ARCHITECTURE  |     | !2r  |     |     |
| -------------------- | --- | ---- | --- | --- |
"' Userldea
_...... Volce/Textlnput
|     | -   | 1-~- |     |     |
| --- | --- | ---- | --- | --- |
Extract use cases automatically
| Generate UML diaa,rams  |     |     | Technology Used:  |     |
| ----------------------- | --- | --- | ----------------- | --- |
| A  Objectives           |     | o   |                   |     |
React.js, Python, Spacy, OpenAI Whisper,
... (:) .A.l.rt:omate SRSg eneration
I
| Extract u;e cases; aut~blly  |         | Qwen, PlantUML / Mermaid  |     |     |
| ---------------------------- | ------- | ------------------------- | --- | --- |
|                              | - - -•  | Q..,.,n 2.5               |     |     |
| Generate UMLdlaarams         |         | Gt Mota                   |     |     |
| I                            |         | LLaMA 3                   |     |     |
Support voke-based requirement input  by Meta  Supervisor and Co-supervisor Name:
•·
TOOLS & TECHNOLOGY  Dr lsma ul Hassan and Mr. Owais ldrees
| *  ,,. 1'  | .:~ ca,  |      |                 |     |
| ---------- | -------- | ---- | --------------- | --- |
|            |          | (11  | Group Members:  |     |
Nod.e..J S
| React.js  Python/ Flask  | sp•Cy NLP  ()rperw Whispt:f'  | PostgreSQL/  |                   |        |
| ------------------------ | ----------------------------- | ------------ | ----------------- | ------ |
| e                        |                               | MoneoDB      | Ali Rizwan (22i - | 2447)  |
| •e                       | Ill                           |              |                   |        |
| -. 'J'                   |                               | !=... •      |                   |        |
Qwen  LL.aMA3  LLaMA3  PlantUML/ PostgreSOL  MongoOB  Abdul Haq Zulfiqar (22i - 2585)
| 2.S  by Meta  | by Meta  MongoOB  |     |     |     |
| ------------- | ----------------- | --- | --- | --- |
APPLKATIONS  FUTURE ENHANCEMENTS  Muhammed Shahmeer (22i -1522)
| • Requin:ment Engina:ring      | • Requirernent ambiguity detectkm  |     |     |     |
| ------------------------------ | ---------------------------------- | --- | --- | --- |
| • AI-Enhcinced Oocun1entatlon  | • Agile backfol!J l!Jenerotk>n     |     |     |     |

FAST NUCES ISLAMABAD CAMPUS

LexConnect
The LexConnect platform is being developed as an Al-powered legal networking and assistance system
while keeping the perspective of lawyers, law firms, and the general public. The platform provides two
main views - User View and Ad min View. The User View allows lawyers and public users to utilize the
platform features such as searching for lawyers, professional networking, legal job opportunities, firm
management, and accessing an Al-powered chatbot for legal assistance. The chatbot helps lawyers prepare
for legal proceedings and assists the public in getting basic legal guidance using natural language queries in
English. If a user feels that the chatbot did not provide an accurate or satisfactory response, they can
submit their query through the feedback option available on the platform.
The Admin View allows administrators to monitor the platform activities, manage users, and review
feedback submitted by users. In case the chatbot fails to answer a query correctly, the admin can update
the knowledge base and improve the system responses to enhance future interactions.
Features include:
•  Searching and discovering lawyers based on expertise, location, and specialization.
•  Professional networking between lawyers, law firms, and legal professionals.
•  Job management and hiring opportunities for legal professionals.
•  Firm management for organizing and maintaining law firm profiles.
•  Social feed for sharing legal updates, discussions, and awareness posts.
•  Al-powered chatbot providing legal assistance and case preparation support.
•  Feedback system allowing users to report incorrect chatbot responses.
•  Knowledge base improvement after admin reviews and updates responses.
Keywords:
Al Chatbot, Legal Networking Platform, MERN Stack, Legal Assistance System, Professional Networking
| NATIONAL UNIVERSITY OF COMPUTING AND  |     |     | •   |     |
| ------------------------------------- | --- | --- | --- | --- |
EMERGING SCIENCES -FAST NUCES
Sclluol Of Computing
-
LEX CONNECT -Law Made Clear. Lawyers Made Accessible
01  Ab,tract
:~r=~=~-ies
| L t x C o n n e c t   i s                         | a n   A J - o o w e r e d   l e g a l   t ila t f o n n                                                                 | • eonnec-c L~ Profe$Slonats     |                                        |     |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------- | --- |
| t h a t  C o n t1 ~ t   I                         | I ~ ,  l a 'N f W' m t: ,  a , d  N   p t b l c                                                                         |                                 |                                        |     |
| I n   o rw i  c o n u a l z e .c                  | l   s y s t e m .  T h o  p l o 1 1 ' o r r "   e n o b l u                                                             |                                 |                                        |     |
| i . w y c i   d ~ y . p o                         | f a ,J O J . . t r t d W Q f k i 1 1 y ,   ~ I                                                                          | •   O f f •  A J   L - v a i l  |   A s s i l : t a n c •                |     |
| 1 0 0   o p p c w t l J t \ l                     | l e S ,   I n d   A I - H S l $ t e d   l e g t l                                                                       | •   lm l ) f ' O " l e A c :    | c H s t o l e g a l S e l v k :e s     |     |
| g u id a l " I S C o e t M .  C I   i n a .   i n | # s I   d t   o n   - f a flP t e f O   W l e - I g   a a l   a c : e o s l l a s i b b o i l t t a y r   i o t o n     | •   O l 1 t b c e   A n s W     | I H li   L i f 9 l l l  O u a t l fl   |     |
| m o r o o f f l e l c n L                         |                                                                                                                         | •   c e n t t a U t < I   i . e | o a i   P l a t f o r m                |     |
03  Architecture
Technology Used:
| #   | ~ - | ~   |     |     |
| --- | --- | --- | --- | --- |
MERN Stack, Kaggle, Github, Visual Studio Code,
Al Chatbct
Us« Interface  Centraliz~ 0'9 tal Platfom,  Figma, Python, Drive, Google Collab
| 04  Timeline  |     | 05  Tools  |     | Supervisor Name:  |
| ------------- | --- | ---------- | --- | ----------------- |
Mr. Ahmad Raza, Mr. Owais ldress
0
Group Members:
|     |     |     | ,0  Saima Saleem (22i-2498)  |     |
| --- | --- | --- | ---------------------------- | --- |
p
Syed Ali Kamzi (22i-2472)
Khawar Mahi ud Din (22i-2657)
Profda & NetW<lrking
Salma Saleem (221-2498)
Mr. Ahmad Raza
Syed Ali Kazmi (22i-2472)
Supervisor
| Co Supervisor: Mr. Owai!;l ldrees  |     | Khawar Mohi ud Din (22i-25671  |     |     |
| ---------------------------------- | --- | ------------------------------ | --- | --- |

FAST NUCES ISLAMABAD CAMPUS

MindPlay
MindPlay is an EEG based universal game controlling system which translates brain signals and head
movement into gaming inputs. This project aims to provide an immersive and accessible gaming
experience for everyone, especially gamers and people with motor impairments. We are mapping
two distinct EEG commands ( motor imagery and eye blinks) and head movements using gyro into
actions. Our initial target is designed by keeping a game called Tuxemon in mind. Our system follows
a sequential pipeline. Firstly, It captures the EEG and gyroscope data from the Smarting 24 headset
in realtime. Then it uses classification models to distinguish between Rest and Hand Imagery. This
intent is then translated into game actions. Our performance such  as classification accuracy is
targeted to be above 70% and response time to be at least S00ms .
...........
ii%
M~Mv,rr,~
,  i, National Unlv. erslty or computer
| J: and Emerging .sciences,  |     |     | M,.Aldt.lt-Shah  |     |     |
| --------------------------- | --- | --- | ---------------- | --- | --- |
.....~ ,t
| lsl•m•t>.d  |     |     | GAH1pMe.-.Mn  |     |     |
| ----------- | --- | --- | ------------- | --- | --- |
,.-W-«1~22. .2 423
U.-T-,tq:UJ..l-4159
|     | Mind Play  |     | SUd AD'•  |     |     |
| --- | ---------- | --- | --------- | --- | --- |
EEG-Based Universal Game Controller
|     | Architecture Di_ag::..r._am_  | ______   |     |     |     |
| --- | ----------------------------- | -------- | --- | --- | --- |
-.......·.
Technology Used:
eTim ellne
|     |     | 8   | Python,Numpy,,Scipy,Sci-kit learn,  |     |     |
| --- | --- | --- | ----------------------------------- | --- | --- |
Joblib,PyQt.,Pytorch,LSL
|     | •   | •   |     |     |     |
| --- | --- | --- | --- | --- | --- |
Supervisor Name:
| Sep-Oct                         | Nov-Oec                   | Jln.fetl                                     |                                      |                     |        |
| ------------------------------- | ------------------------- | -------------------------------------------- | ------------------------------------ | ------------------- | ------ |
|                                 |                           |                                              | M•r•A.pr                             | Ms. Anum Kaleem     |        |
| • Module I; Sfgl\all            | • MOC:hflt 2:             | • MOOU e 3: Game                             | • Modl..R4                           |                     |        |
| . t. cq u i sl o o n -          | P_r o c.e u .i n.s & .    | .ln,,t~,.!'.a.u. on-                         | EY 3 1 u ,1 ,t M -                   |                     |        |
| ~ b H s h l n g s i.,t,ie       | ~ 5 1 f b 0 0 0. .-.      |                                              | P tr t o n n . /'K e                 |                     |        |
| Ct>nn@Ct.lOM .and               |                           | corrmands to                                 |                                      | Group Members:      |        |
| s y oc h t o n l l i f C        | r n o d f f l an d        |                                              | '""""'                               |                     |        |
| E fG J lj ,y r o   tf a t ,11   | ~ f t l t t r in g        | . T tn. u .S. w U,.m, . . ~ &., ~ s,e  n d   | " m " e ' ,s " u ' r " e ' m   ent.  |                     |        |
|                                 |                           | a rN eSS                                     |                                      | Jawad Saleem (i22 - | 2423)  |
.M"d~trbls.
Tools & Technologies
|     |     |     |     | Usman Tariq (i22 - | 2459)  |
| --- | --- | --- | --- | ------------------ | ------ |
|     |     |     |     | Saad Abrar (i22 -  | 1238)  |

FAST NUCES ISLAMABAD CAMPUS

MindMesh
MindMesh is a unified, web-based workspace that brings a team's tasks, communication,
documents, meetings, and knowledge into one place. It reduces context switching by combining
planning views (boards/tables/timeline/calendar), collaborative wikis, discussion threads, and in-
app meetings with automatic transcription and summaries. It also includes Ask Mindy, an Al
assistant that lets users ask questions in natural language and get answers from workspace content.
Features include:
• Workspaces and Projects for team collaboration
• Task/knowledge views: Kanban board, table, timeline, calendar
• Collaborative wiki pages (rich-text documentation)
• Discussion threads for communication
• ln-app video meetings (host/join)
• Meeting transcription and auto-generated summaries
• Ask Mindy: Al-based Q&A over workspace knowledge
• Integrations (e.g., Google Drive, Slack)
• Dockable multi-window interface for multitasking
Key Words:
• Unified Workspace, Al Assistant/ RAG, Meeting Transcription & Summarization, Collaborative Wikis
Productivity & Team Collaborntion.
mindmesh
lean Members Supervisor Co•Superv1sor
o.--s----tocut
.l.t.n,o.W..l_ld,g IeI. c-a, Al--paY..w ed YOrk..,ace flat ...... CCll'TY'nlnCatian.
tool ,, .., ••t atlal .... booet pNdYctlvltJ
lihiiiiM
Technology Used:
t.- !! TypeScript,Next.js, Visual Studio
- -
T........... - Supervisor Name:
-
Usu TWrd Is ......... ..,_
P.-ty a o,,,.i...... Al Mr. Bilal Khalid Dar
WIWl::i'
Group Members:
- Noor Junaina (22i-2633)
..... ...,
Warda Aziz (22i-1542)
Tools & Technology
FAST NUCES ISLAMABAD CAMPUS

AgriSmart
AgriSmart is an Al-based smart farming platform designed for small-scale farmers in Pakistan, particularly
for wheat, rice, and cotton crops. The application helps farmers detect crop diseases early, receive proper
treatment guidance, and manage daily farming activities through an easy-to-use mobile interface.
Farmers can capture crop images using their smartphones, which are analyzed by deep learning models
(YOLOv11) to detect diseases accurately. After detection, the system provides localized cure
recommendations and generates personalized farming schedules based on crop type and season. The
platform also includes GPS-based geotagging to create regional disease heatmaps, enabling smarter
monitoring and intervention. A multilingual (English/Urdu) voice-enabled chatbot allows farmers to ask
queries in text or voice for real-time assistance.
AgriSmart integrates React Native, Flask, TensorFlow, MongoDB, and Postgres to deliver an intelligent,
scalable, and farmer-friendly solution aimed at reducing crop losses and improving productivity.
Features Include:
• Al-based crop disease detection
• Disease cure guidance
• Personalized farming schedules
• Geotagging & disease heatmaps & Timelapse
• Multilingual voice-enabled chatbot
Key Words: Artificial Intelligence, Machine Learning, Smart Agriculture, Crop Disease Detection, Mobile App
PROJECT TEAM Supervisor
Azghan Ahmad (221-2667) Dr. Atf Aftab Ahmad Jilani
M. Faisal !221-87S8) Co Supervisor
Talha Mukhliar (221-2720) Dr. Zahid Mahmooc (NARC)
AgrY
AgriSmart is an Al powered agricultJral assistance olatform
designed to help farmers detect crop ciscases early and manage
farming activities efficiently.
TOOLS WORKFLOW
rID. • .
~ -J OpenWeather
Technology Used:
(
React Native, Flask, Python, Postgres,
aii·• TensorFlow (YOLOv11), Docker, GitHub,
- ·• Open Weather
- ·• 1-----------------'---------,
~--~---------~--~~ASn,_ ___________
S_u_p~e_rv_i_s_o_r_N_a_m_e_: .
Dr. Atif Aftab Ahmed Jilani
Group Members:
Muhammad Faisal (i22-8758)
Azghan Ahmad (i22-2667)
Talha Mukhtiar (i22-2720)
FAST NUCES ISLAMABAD CAMPUS

PsyPlex-AI
Psyplex-AI is  being  developed  with a  focus on  enhancing  personal  mental wellness through
advanced Al.
The app features two main views: User Dashboard and Al Analysis Layer. The former enables users
to track mood trends, record voice journals, and analyze their digital well-being through real-time
domain classification of browsing history. The latter allows the Al engine to map these habits to
emotional  shifts,  providing  context-aware  support  via  a RAG  (Retrieval-Augmented
Generation) system. If an Al response feels insufficient, users can easily provide feedback to refine
the system's empathy and accuracy.
Features include:
•  Mental  health  related  queries  including  personalized  wellness  trends,  emotional
correlations, and habit analysis.
•  Realtime domain classification from local Chrome browsing history.
•  Voice-to-text journaling including mood tagging and secure transcript storage.
•  Context-aware Al support through RAG-based chatbot interaction.
•  Correlation analysis mapping digital habits to physiological mood shifts.
Key Words: (React, Node.js, Python FastAPI, RAG, Multimodal Sentiment Analysis)
| •   | Psyplex-AI  |     |     |     |     |     |
| --- | ----------- | --- | --- | --- | --- | --- |
Empowering your mental wellness journey.
I
Architecture
 ;a  S er v ices]
|     |     | I-7 _f   | Pytho n  A l  |     |     |     |
| --- | --- | -------- | ------------- | --- | --- | --- |
(F a 51 A P II
| I   |     |     | l   |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
React  ,.::::,. Node.Js
|     | Frontend  | U~ Gateway  |            |     |     |     |
| --- | --------- | ----------- | ---------- | --- | --- | --- |
|     |           |             | t MongoDB  | ]   |     |     |
I
Key Features
Technology Used:
|     |      | ~J  | El  |     |     |     |
| --- | ---- | --- | --- | --- | --- | --- |
| @   | jE)  |     |     |     |     |     |
React, node js, python, mongoDB, FastAPI, Git,
Supervisor Name:
| Mood  | Smart Journaling  | RAG-Enhanced  | Browsing  |     |     |     |
| ----- | ----------------- | ------------- | --------- | --- | --- | --- |
Tracking  (Al Voice-to-Text)  Chatbot  Analysis  Mr. Hassan Mustafa
I
Proje ct Timeline  Group Members:
| -   |     | -   |     |     |     |     |
| --- | --- | --- | --- | --- | --- | --- |
-
|                   |                   |                    |                 | ,   | Fawad Humayun (i22 - | 2548)  |
| ----------------- | ----------------- | ------------------ | --------------- | --- | -------------------- | ------ |
| Aug-Sept 2025:    | Oct-Nov 2025:     | Feb-Mar 2026:      | Apr-May 2026:   |     |                      |        |
| F®ndation & Auth  | Core Feat1Ke$     | Advanced Al        | Final Polish &  |     |                      |        |
|                   | (Mood/Joumallng)  | (Chatbol/Ga,,..s)  | Optimiza~on     |     |                      |        |
Areeba Nisar (i22 - 8770)
Tools
|                            | n•J~  |                       |                     |     | Muhammad Abdullah (i22 - | 0591)  |
| -------------------------- | ----- | --------------------- | ------------------- | --- | ------------------------ | ------ |
|                            |       | I' python  • MongoDB  | O FastAPI           |     |                          |        |
| Tum Members:               |       | Supervisor.           | Co-Supervisor.      |     |                          |        |
| I 1222548 Fawacl HIJ<MYOO  |       | Mr. Junailt Ali Khan  | Mr. Blal KhaBd Oar  |     |                          |        |
i228770 AIHbt Niffr
1220591 Mullamrnad Abdullah

FAST NUCES ISLAMABAD CAMPUS

Aureya
Aureya is an Al-powered fashion e-commerce aggregator developed for the South Asian market, designed
to connect multiple fashion brands with shoppers on a unified platform. The system focuses on intelligent
personalization by recommending clothing based on a user's skin tone using computer vision and color
science techniques.
There are two main views of this platform - Shopper View and Brand View. The former allows shoppers to
browse products from different brands, upload a image for Al-based skin tone detection, receive
personalized color recommendations, view product details, and write reviews with ratings. If needed,
shoppers can manage their profiles and view tailored suggestions based on their detected skin tone.
The latter is for brands, where they can register, manage their product catalog (single or bulk upload), upload
product images with automatic color extraction, monitor product analytics, and track their Brand
Transparency Score. Brands can also update product details and manage inventory.
Features include Al-based skin tone detection using face recognition and Lab color classification, dominant
color extraction from clothing images using K-Means clustering, a color-matching recommendation engine
based on Delta-E distance, sentiment analysis of customer reviews, secure authentication, and analytics
dashboards.
Key Words: Computer Vision, Skin Tone Detection, E-commerce Aggregator, Color Science, Personalized
Recommendation System
Aureya
Al-Powered Fashion Aggregator Platform
An Al marketplace offering taHored st)ie re<ornmendatiom based on physical attnbutes and Intelligent
semantic searth.
An automated platform featuring sentiment-based brand verification and reliable intematiooal fulfillment.
Architecture
Ali\llinl
'ij!I W r eb sl!IS
+ -:r::: +
AIWd> a s-n 11,;.llecamlerd>tion
sc,ap,r '"\ se.vcn tto
@: Technology Used:
-.-
Next.js, Node.js, FastAPI, MediaPipe
Timeline - 1$ - _ FAISS, Postgres, Scikit-Learn, Typescript
Iteration 1 llcral.ion 2: [!!;~~ llcralion4: Supervisor Name:
lr"!Pt'liltt~on IM1•U1ni."!II OtioF#lnoln
COIi h11MldllrtStt11p ~~~<I- °""'""'
Ms. Laiba lmran
Feb-Mar
Group Members:
OFastAPI
ScikHeam Zaim Abbasi (221-2462)
Group Members:-
Hammad Ali (221-0628)
Supervisor: Zaim Abbasi (221-2462)
Ms. Laiba lmran Hammad Ali (221-0628)
Hussain Murtaza 1221-1513\ Hussain Murtaza (221-1513)
FAST NUCES ISLAMABAD CAMPUS

ClothCraft Al
ClothCraft Al app is being made, whilst keeping the perspective of fashion design students and
professionals in mind. This unified application provides a single, seamless workspace for users to
leverage our features to transform simple doodles into realistic clothing visualizations on 2D
human models, extract color palettes from emotions, generate outfits from moodboards, and
convert basic sketches into repeatable fabric textures. Designer if in any case feels that the
generated design didn't perfectly match their vision, designer can easily send the outfit photo to
the hybrid editor to sketch modifications directly over it, or utilize the style bending tool to blend
two different outfit photos into a new, in-between concept. All of these core tools are integrated
into one cohesive interface to streamline the rapid prototyping and design process without
needing to switch contexts.
Features include transforming doodles into realistic clothes on text-generated 2D models,
emotion-driven color matching, and moodboard-based outfit generation. Additionally, it offers
style bending to seamlessly blend two uploaded outfit photos, a pattern maker for fabric textures.
| C+3  ClothCraft AI  |     |     |     |     |     |
| ------------------- | --- | --- | --- | --- | --- |
Transform user sketchec 1ash on docdles into realistic
clothing designs using Cenerntive Al
WORKFLOW
Technology Used:
React, Python, Pytorch, MongoDB
Supervisor Name:
-•
| TIMELINE  |     | ,,,,.-- |     |     | Dr. Behjat Zuhaira  |
| --------- | --- | ------- | --- | --- | ------------------- |
...
|              | Training &      | /             | Integration &  /   |     |                 |
| ------------ | --------------- | ------------- | ------------------ | --- | --------------- |
| ,,,,. Data   |                 | Feature""     |                    |     | Grou  Members:  |
| Preparation  | \  Prototyping  | /  Expansion  | \  Deployemnt 'Ji  |     |                 |
Sep-Od 2020  '  -N-+~ 2-02~  Fi:b-rthn 2026  '  -"l)r May 20.2.,6, ,  Hassan llyas (i22 -2414)
| TOOLS  |     | TEAM MEMBERS  |     |     |     |
| ------ | --- | ------------- | --- | --- | --- |
M. Fahad (i22 -2492)
|     |     | Hassan llyas  | 221-2414  |                           |     |
| --- | --- | ------------- | --------- | ------------------------- | --- |
|     |     | M. Fahad      | 221-2492  |                           |     |
|     |     | Samyan Ahmed  | 221-2639  | Samyan Ahmed (i22 -2639)  |     |
supervisor:
Dr. Behjat Zuhaira

FAST NUCES ISLAMABAD CAMPUS

Orli - Al-Powered Print-on-Demand Platform
Orli is a next-generation print-on-demand platform designed to empower local artists, independent
designers, and small-scale entrepreneurs by connecting them directly with manufacturers and
customers. Customers can browse, preview, and purchase unique merchandise with real-time
product visualization, while designers create and enhance artwork using Al-powered tools (20
previews, 30 rendering, generative design suggestions) and manage storefronts with analytics.
Manufacturers handle printing, packaging, and shipping through a dedicated dashboard, and
administrators oversee user management, content moderation, and financial operations. Secure
payment integration ensures transparent payouts for creators and vendors, reimagining the
traditional print-on-demand model into a scalable, Al-enhanced ecosystem tailored for the
Pakistani market.
Features include:
• Al-assisted design generation and enhancement
• Real-time product previews on merchandise (t-shirts, stickers)
• Storefront creation and SEO optimization for designers
• Manufacturer dashboard for order fulfillment and inventory management
• Secure financial operations with split payments and transparent payouts
• Admin portal for system monitoring, analytics, and content moderation
._,__c·, -.., •., . ....
Orli
I I 2 2 2 2 12 1 t 2 8 6 1 1d_A _ .ft4'1 ~ ,(I ,\ d ,h U lc r , .0 q 1 r
"'-""•
2212718_.A&l-a.M~
Al Powered Print-on-Demand Platform
°"1--
• Al-os~•~tt:td dasign 98'11:trotion & enhancement
• Real-time product preview!; (t-shirts, stickers)
• Storefront creation & SEO opt1miz.ahon
• Monufocturer doshboord for order fulfi I
.
m,,. a,n !
• SA-cur& poymAnts & trorispor@nt payouts
l
Technology Used:
. ;; . Buy from a Marketplace Fabric.js/Konva.js, React.js, Node.js + Express,
.C.:
.; Mongo0B, Integrated Payment Gateway, VS
0 Design
using our Code, Git,
tools
Supervisor Name:
Dr. Behjat Zuhaira
Recieve order
Group Members:
Anishra Ashfaq (i22 - 2614)
Muhammad Uzair Choudhary (i22 - 2681)
Aisha Adil (i22 - 2718)
FAST NUCES ISLAMABAD CAMPUS

Tutorify
Tutorify is a microservices-based educational platform designed to seamlessly connect students,
tutors, parents, and administrators within a scalable and intelligent digital ecosystem. Built using
modern technologies such as React, Node.js, Express.js, MongoDB, Redis, Docker, and
Kubernetes, the platform ensures high performance, modularity, and real-time communication. It
integrates Al-powered assistance through RAG (Retrieval-Augmented Generation) to provide
personalized academic support and instant query resolution. Core features include structured
course management with assignments and quizzes, live video tutoring sessions, secure escrow-
based payment processing, gamified progress tracking with points and badges, community
discussion forums, real-time notifications, and review and rating systems. Parents can monitor
academic performance through detailed dashboards and scheduled updates, while administrators
manage analytics, tutor verification, disputes, and overall platform governance. Tutorify enhances
accessibility to quality education, ensures secure financial transactions, promotes transparency,
and delivers a data-driven, interactive learning experience through a robust microservices
architecture.
Or'OuP-tllU..-•
Ab,:V "'"="7 ??1--?. ..0 3
M_.,r.,1,<.l.w_1t.1. .;.>.,.,.f,o..r. ~¥1f,l., ._?:,.V:.lIn'!l
TUTORIFY
Al-po--""'orcd Mlcroeorvlocs-basod Edvoatlonul Plutform
¼0 T11r.orit1,1 iA n rnic.rOfien,K',P.A-h.-"l!ioRd ed1;c-.,-..:it:1orml
I p p o ln r t e :f n 'o t: r ~ m . n c n JO c m t n SiJ C n l O m d i n t l. o :1t r c o o .1 n : n nr o ~ c in t 1 n >t .1 u x n -J it n 'i n .. t i : i r d .. d 1:' i 1 g 1t t o t:n rf l i,
.-,=: Cl('"..O!'O_u,:i.torn.
PROBLEM STATEMENT a .PROPOSEO SOLUTION
L.~ck of' Gocu,·c;;i, ~alnblo, al"ld PQl"=n::L.llza.::J iGt:udcwrt-
(f-·:--.. tutor pt.'3..t:formi:: re t.olvod bl.I Tl.ltorl1'u·i. Al pnworad
I' --~:::, r-1rt:orfn9, t1AC.l1r.a pn.!Jm&nr-~. pt1.r.ant ClD.:1r-.oonrCl~,
rQnl-tlfT'Kll vldoo !IOSi!llon:!1, nnd gnmfflQd progr,o,a~
PIIOCCESS FLOW
Technology Used:
React 19, Node.js, Express.js, MongoDB, Redis,
Docker, Kubernetes, Stripe, Socket.io,
ChromaDB, Google Generative Al, Clerk
1
~ NONffOalN.0 - &. Authentication, Stream.io Video SDK,
PROJECT TIMl!LINI!
TailwindCSS, Vite
Supervisor Name:
Dr. Uzma Mahar
Group Members:
Abdul Moiz (i22 - 2493)
Fa had Zafar (i22 - 2525)
TOOLS AND TECHNOLOGIES
Muhammad Haris (i22 - 2479)
FAST NUCES ISLAMABAD CAMPUS

KickSense- Al Powered Football Analysis System
KickScnsc is a specialized platform designed for automated analysis of football matches through
video processing. The application provides two distinct perspectives: The Coach/User View and
the Analyst/A dmin View. The Coach/User View is designed for team managers and coaching
staff to access actionable insights. Users can query specific player metrics, review tactical
summaries, and visualize match data to aid in strategic decision-making and post-match
evaluation. The Analyst/Admin View is for the technical personnel responsible for match setup.
The admin manages the initial configumtion, including video uploads, field dimension calibration,
and team assignment verification to ensure the system generates accurate pe1formance data.
Features include:
• Player and Ball Tracking: Consistent identification and continuous movement tracking
of every player and the ball throughout the duration of the match.
• Physical Performance Metrics: Calculation of essential physical performance data,
including top sprinting speeds and total distance covered by each player.
• Team Cohesion Analysis: Measurement of tactical compactness and
organizational discipline for both teams to evaluate defensive and offensive
positioning.
• Passing and Possession Statistics: Automated identification of passing sequences,
individual and team pass completion rates, and overall possession percentages.
• Interactive Tactical Dashboard: Visual representation of match data through
dynamic heatmaps and passing networks for intuitive analysis.
• Automated Match Reporting: Generation and export of professional, detailed
match reports intended for long-term performance tracking and review.
Key Words: 1. Sports Analytics, 2. Performance Tracking, 3. Tactical Analysis,4. Football Intelligence, 5.
Automated Reporting.
KickSensC, •
-Al POWERED FOOTBALL ANALYSIS SYSTEM
Automated analysis of football matches through video
processing for Coaches & Analysts.
Technology Used:
Python, YOLOv8, OpenCV, React, NVIDIA
(CUDA), Visual Studio
Supervisor Name:
Dr. Atif Aftab Ahmad Gillani
Group Members:
Mustafa Zafar Khan (i22-2425)
Areeba Naeem (i22-1502)
Muhammad Tayyab (i22-2698)
FAST NUCES ISLAMABAD CAMPUS

DevOps Automation (DevHex)
DevHex is an Al-powered, agent-based deployment automation platform designed to
simplify the software deployment lifecycle for developers and DevOps engineers. It
operates in two modes.Interactive Mode, where an Al chatbot guides users in natural
language to configure and execute deployment pipelines, and Auto Mode, which enables
fully automated, hands-free continuous delivery. Built-in rollback and rollover
mechanisms instantly restore the last stable state upon failure, minimizing downtime.
The platform supports real-time VM command execution across cloud environments
(AWS, Azure, GCP) and private/hybrid servers, with seamless integration into existing
Cl/CD tools like Jenkins, GitHub Actions, and Gitlab Cl. A cloud recommendation engine
suggests the most optimal provider based on workload needs, while session and history
Management ensures complete auditability of all deployment activities. Additionally,
DevHex performs automated VM environment inspection to verify deployment readiness,
ensuring compatibility before any release is executed.
Key Words: Agentic Al, DevOps Automation, Cl/CD Pipeline,
Deployment Orchestration, Large Language Models (LLM)
Technology Used:
Python, LangChain, LangGraph,
FastAPI, React.js, Docker,
Jenkins, GitHub Actions,
OpenAI GPT, AWS /Azure/ GCP
Supervisor Name:
Sir Zaheer ul Hussain Sani
Group Members:
Hassan Ejaz (i22 - 2434)
Muhammad Awais Rafique (i22 -2511)
Sana Urooj (i22 - 2456)
FAST NUCES ISLAMABAD CAMPUS

FYPilot-AI Driven FYP Evaluation & Automation System
FYPilot is an Al powered platform designed to streamline the Final Year Project process for
students, supervisors, and committees. It tackles pre-defense challenges such as originality
validation, repetitive reviews, scattered feedback, and communication gaps by integrating
intelligent evaluation, structured workflows, and centralized monitoring to improve transparency,
reduce faculty workload, and enhance academic quality. Key features include:
• Automated project originality and similarity checking
• Al driven feature enhancement and technical depth evaluation
• Slide and UML diagram validation
• Al powered mock defense simulation with feedback
• Supervisor review and progress tracking dashboard
• Committee oversight with query management and centralized announcements
• Meeting scheduling and slot booking
Key Words: Artificial Intelligence, Originality Detection, Automated Evaluation, Academic
Workflow Automation, Role Based Access Control
AI--Driuen FVP aulol, iation & evaluation system
Flow Diagram:
ftoleeu.d l"l11tfonn
.I, l
: if
. l.,T {i;
........
Pr~~ l'NlfldKa<oiew
o-..
Technolo Used:
Timeline: • Uoclc Defense Simulation
0. PERN stack, Computer Vision, Natural
• Orl&lnaUty Cl'l•c:k
• Felli tu re enhanc•ment 9 Lan ua e Process in
• Slide&. UPAL vatid,1_tion · ~:;;;itt•• Supervisor Name:
• Meetlntsd'ledullnt 1------------------------------1
• Supervisor review and rnanagemerit
profreut"'cldn& and Mr. Junaid Ali Khan
Sep-Oct
Grou Members:
Shiza Najeeb (22i -1532)
April
llb,-Oec Team Members: Sofia Ra heel (22i -0596)
Tools: Supervisor: \1r.Junnid Ali Khan
@®*• - Noor ul Iman (22i - 1524)
Sofia Rahccl I 221-o;~G
'.\Joor LIi lm~l!m I n l-15-z1
~I,;,,. :-1:ijt>t·b I n l-15.1•
FAST NUCES ISLAMABAD CAMPUS

Sentinel: A Hybrid Wi-Fi CSI and Computer Vision Surveillance System
Sentinel is an advanced hybrid home surveillance solution that integrates Wi-Fi Channel State
Information (CSI) sensing with Computer Vision to provide intelligent, adaptive, and privacy-
preserving threat detection. The system enables continuous monitoring in indoor environments by
leveraging the penetrative capabilities of Wi-Fi signals (which work through walls and in darkness)
alongside the semantic richness of visual analytics.
Features include:
• Hybrid Threat Detection: Uses a deep learning-based fusion model (e.g., CNN-LSTM) to integrate
spatial visual features with temporal CSI patterns to classify threats like intruders.
• Privacy-Preserving Monitoring: Offers configurable privacy modes, including "Wi-Fi-only" where
cameras are disabled but RF sensing continues, and ensures all raw data is processed locally.
• Adaptive Learning Engine: Automatically refined detection models using locally collected data to
adapt to environmental changes like furniture rearrangement.
• Blind Spot Coverage: Wi-Fi signals penetrate occlusions to detect movement in areas hidden
from the camera's line-of-sight.
• Multi-Modal Data Fusion: Employs a Bayesian decision engine to weight sensory inputs based
on reliability (e.g., prioritizing Wi-Fi in low light).
Key Words:
Wi-Fi CSI, Computer Vision, Sensor Fusion, Edge Al, Anomaly Detection
Technology Used:
Python, OpenCV, TensorFlow/PyTorch,
Scikit-learn, ESP32-class microcontroller
Supervisor Name:
Dr. Subhan Ullah
Group Members:
Affan Hameed (i22 - 2582)
Bilal Mehmood (i22 - 2452)
Shoaib Mehmood (i22 - 2448)
FAST NUCES ISLAMABAD CAMPUS

NeuroDrive -Al Powered Driving Assistant
NeuroDrive is an Al-powered Advanced Driver Assistance System (ADAS) designed to enhance
road safety through real-time monitoring, intelligent risk assessment, and explainable alerts. Built
using Python, OpenCV, YOLOv8, TensorFlow, and Llama 3.2 38 LLM on Raspberry Pi hardware, the
system integrates eleven interconnected modules providing lane departure warnings, blind spot
monitoring, traffic sign detection, driver distraction detection, forward collision warnings,
pedestrian intent prediction, and overtake assistance. Unlike conventional ADAS solutions,
NeuroDrive utilizes a Large Language Model to generate natural language explanations for
warnings, helping drivers understand system decisions. Multi-camera inputs from dash and side
mirror cameras stream to a central processing unit for real-time analysis with OBD-11 vehicle
telemetry integration. The system features weather-adaptive threshold adjustments,
priority-based alert management for emergency vehicles, and post-trip driving style feedback. All
processing occurs locally to ensure privacy and maintain low alert latency for critical warnings,
providing predictive context awareness, explainable Al-driven insights, and comprehensive safety
coverage across diverse environmental conditions.
Key Words: Advanced Driver Assistance Systems, Explainable Al, Computer Vision, Real-time Object
Detection, LLM-Based Risk Assessment.
NeuroDrive
Al POWERED DRIVING ASSISTANT
NeuroDrive is an Al-
powered Advanced Driver
Assistance System (ADAS)
developed to enhance road
safety through real-time f.
Al Modules ! - • -
monitoring, intelligent risk io
I .,. Object Detection
assessment, ;md Lone Ottecuon -:
Driver Monitoring ..., •
explainable driver alerts l... • Risk Assessment _. Risk _.,. Alert Technology Used:
UM Explanation Engine
Python, OpenCV, YOLOv8, TensorFlow, Llama
1111
Alert• VOC.e
3.2 3B, Raspberry Pi, NumPy, scikit-learn, D-lib
Su ervisor Name:
Dr. Shahela Saif
Group Members:
lmaduddin Ansari (i22 -2446)
Bushra Sajid (i22 -2613)
Imaduddin Ansari 22i2446
Bushra Sajid 22i2613 Waleed Abdullah i(22 -2714)
WaleedAbdullah 22i2714
~uperyjsor; Dr. Shahela Saif
FAST NUCES ISLAMABAD CAMPUS

CodeCraft- Crafting Tech Stacks from your ideas
CodeCraft is an Al-powered full-stack application generator where users upload ERDs, describe
business domains in natural language, or provide existing UI designs, and the system uses FastAPI,
LangGraph, and LLMs to perform schema extraction, role and business-rule analysis, and UI
understanding and can inspect, refine, and selectively regenerate layers of the stack. From these
inputs, CodeCraft synthesizes complete backends (Node.js/Express/TypeScript with Sequelize and
PostgreSQL, including REST APls, auth, validation, and middleware) and frontends
(React/Typescript with Tailwind or CSS Modules, component hierarchies, and responsive layouts),
packaged as runnable projects.
Features include:
Automated Express/Node.js backend generation from ERDs and React.js frontend files, featuring
schema extraction, model creation, and REST API development.
Prompt-based business logic and RBAC extraction including roles, permissions, and middleware
generation.
Al-powered frontend generation from UI designs such as Figma, Canva, screenshots or Backend
files into React/Typescript projects.
End-to-end full-stack scaffolding with aligned frontend and backend architectures.
Key Words: Artificial Intelligence (Generative & Agentic Al), Full-Stack Web Development, RBAC
Crafting Tech Stacks from your Ideas
ARCHITECTURE Supervisor: Mt Zaheer ul Hussain Sani
Upk>ad EROS.
Group Members: H
Ri
u
m
d
s
a
h
A
a
s
N
lm
is a
N
r
y
1
a
22
z
-
e;ea o,,•,, --
Business Domains. Hamza Tufall ~" -"'61
Technology Used:
CodeCraft
rafting Tech Stacks Python, FAST API, Langgraph, Langchain,
your Ideas
..
Uvicorn ,Stream lit, React js
WORKFLOW Supervisor Name:
ERO-driven backend generation
Mr.Zaheer ul Hussain Sani
Converts EROs into Nodo~t,/E.KprllU b.Kkend~ w1lh Typt'Sc:ript & REST APls.
Prompt-based business loglc &. RBAC extraction
Extracts roles, permiSSK)rl$.. and mlddlew3re In perman spre:3CS. Group Members:
Al-powered frontend generatio<1 from UI designs Huda Asim Nyazee (i22 -8790)
Transforms Aoma, or screenshot UI deSigns Into React/fypeScr1Pt projects.
End-to-end full-stack Kaffoldlng Rimsha Nisar (i22 - 2426)
Aligns front.end ¥td backend mooe with finised a~k:ations.
l(eyW ords: A.rtlfi, 11 •· FtA.C::u,rk ~ t ~Central (ARAC) Hamza Tufail (i22 - 2458)
FAST NUCES ISLAMABAD CAMPUS

BVLOS Drone with Internet Connectivity
A software-centric Drone-as-a-Service (DaaS) platform is being developed for autonomous
missions. The system features two primary interfaces: Operator View, used by pilots to manage
waypoints, flight parameters, and real-time telemetry (GPS, altitude, battery), and the Customer
View, which provides read-only access to live video and mission analytics for specific services like
solar inspections or traffic monitoring. If the Al safety engine detects obstacles or connection is
lost, the system triggers automated responses such as hovering, rerouting, or Return-to-Home
(RTH). The cloud backend orchestrates all interactions, ensuring high-frequency data is logged and
processed for real-time situational awareness.
Features include:
BVLOS Operation: Autonomous flight beyond visual line of sight via 4G/LTE/lnternet
infrastructure.
Real-time Telemetry & Video: Live streaming of sensor data and video feeds via MQTT and
WebRTC.
Al Safety Engine: Automated obstacle detection and collision management using cloud-trained
models.
Mission Planning: Web dashboard for defining GPS waypoints and virtual geofence boundaries.
Cloud Data Logging: Automated persistence of flight logs and safety incidents to a MongoDB
database.
Key Words: 1. BVLOS 2. DaaS 3. loT-Cloud Integration 4. Edge Computing (Raspberry Pi) 5. Al
Safety & Collision Management.
BVLOS
Drone with Internet Connectivity
| a A fully  d   to N lt h  •  o u a                     | tf t n 'I  G C S  A n d  o l o u  | d • b • BVLOS dron• built from  •• d   6-•lon•, .-.•1..-tlme ••••(Dma•a•S. . )y ,p a | la t fo r t n .  |     |     |
| ------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------ | ---------------- | --- | --- |
| T h e   d r o n •  •                                   | ,_ . p p o .-. .  w • y p o l n t | - ~ •• d   m                                                                         | n d  l l v •     |     |     |
| vlcleo •treemlng o-.-th• lnlern..,, with olo..,d Al •- |                                   | •'-'tonomo,_.•                                                                       | de-              |     |     |
t.vu1.tvn, Thtw .otuUun vv1nblna• 1.u•t.v1n haon:t-•r•, rwn,,i;n.• opw1•dQ0·1-. •nd ,..,.
|     | ,or  | u•• in  | onct oi- |     |     |
| --- | ---- | ------- | -------- | --- | --- |
•••t•r
IIVLO,S Conn9edylty:
lon11-r•n11• flight: ov•r  Technology Used:
t.h• lntern•t: u.rno Aaepberry Pl
| •"d ,40/L  | lnbaetruotu-.  |     |     |     |     |
| ---------- | -------------- | --- | --- | --- | --- |
Python, JavaScript (Node.js, React), Raspberry
| gwi!'!~•t-.:.=t  | o b t - t  d                     | e t e o -     |     |     |     |
| ---------------- | -------------------------------- | ------------- | --- | --- | --- |
| tl o n   a n     | d   • • •-- -v   rdl o-g l •a  - | to•   tth ••  |     |     |     |
o l o u d  t o   k - p  h • -   Pi 5, Express, REST APls, MongoDB, MQTT,
lvw,
A••I-Dm• Da!bboard=  WebRTC,, DroneKit-Python.
| Prevlol:I.,• •  | Wf!tb-b••..cl ln•- | •   |     |     |     |
| --------------- | ------------------ | --- | --- | --- | --- |
f••• •-Nv• vld•o •'---'"••
n1na.  t ... m•tr,r, •nd ml••lon pl•"•  Supervisor Name:
| A u t • - - | - • u •  S • # • t : y ,  |     |     |     |     |
| ----------- | ------------------------- | --- | --- | --- | --- |
" " • •t u .- • •  - .. t o m a ' l a d  r • • p o n• - Dr. Atif Aftab Ahmed Jilani
| • •   I N c e |   a u 1 0 - n o v e r   a n | d   R e- |     |     |     |
| ------------- | --------------------------- | -------- | --- | --- | --- |
| htm-to-Hont•  | 'for  obataol•              |          |     |     |     |
•vo.ldan.o• or llnk ,_._
Group Members:
TECHNOLOGIF-S USED
|     |     | ®   |     | Mohammad Abdullah Khan (i22 - | 2600)  |
| --- | --- | --- | --- | ----------------------------- | ------ |
NODE.JS
®
HIVt!MO
|     |     |     |     | Shahzaib Muhamamd Akram (i22 - | 2450)  |
| --- | --- | --- | --- | ------------------------------ | ------ |
•  AA8PIHtAAV Pl
|     |     | <.;~  REACT  |     |     |     |
| --- | --- | ------------ | --- | --- | --- |

FAST NUCES ISLAMABAD CAMPUS

Voiture
Voiture - The 3D Van Builder is a web-based interactive configurator designed to transform how
camper vans are customized and purchased. The platform enables users to design, visualize, and
configure camper vans in real-time using immersive 3D rendering technology.
The system bridges the gap between camper van manufacturers and customers by offering
seamless customization, pricing estimation, order management, and payment integration within a
single digital platform.
Problem
Traditional camper van customization relies on catalogs, 2D mockups, or physical showrooms,
which are costly and limit customer visualization. Existing 3D tools lack complete order and
payment workflows, resulting in fragmented customer journeys.
Solution: Real-time 3D van customization-Dynamic component visualization-Interactive camera
controls-Drag-and-drop modular placement-Real-time pricing estimation-Admin-managed price
approvals-Secure payment integration (Stripe}-Order management & dashboards
Key Features: 3D Model Integration (GLTF/GLB models)-Real-Time 3D Rendering (Three.js +
React Fiber)-Visualization & Interaction Engine -Customizable Components & Pricing - User &
Admin Management -Order & Payment Integration-Cloud Deployment & Cl/CD
Key Words: Real-Time 3D Visualization-Web-Based Product Configurator-Three.js Rendering Engine-
Customization & Pricing Engine- Interactive 3D Modeling
Technology Used:
Blender, Three.js, React Fiber, Next.js, Stripe,
SQL / NoSQL, GitHub Action, Vercel.
Su ervisor Name:
Dr.lsma ul Hassan
Group Members:
Hamna Noor (22i-2480)
Yahya Hassan (22i-1549)
Ali Hamza (22i-2535)
FAST NUCES ISLAMABAD CAMPUS

Crime Chain
CrimeChain is a blockchain-based criminal record and digital evidence management system developed to
ensure transparency, integrity, and security in law enforcement operations. It addresses key issues in
traditional crime reporting such as data tampering, lack of transparency, delayed case handling, and
fragmented record storage. By leveraging blockchain technology, the system provides immutable and
verifiable storage of FIRs, case updates, and digital evidence, ensuring accountability throughout the
investigation lifecycle.
The platform enables citizens to report crimes digitally, upload supporting evidence, and track complaint
status securely. Authorized law enforcement officials can verify FIR submissions, manage investigations, and
update records within a controlled environment. All transactions are recorded on the blockchain, creating a
permanent audit trail that prevents unauthorized modification and strengthens institutional trust.
Through secure authentication and role-based access control, CrimeChain protects sensitive data while
maintaining transparency for authorized stakeholders. Its decentralized architecture ensures traceability,
consistency, and reliable access across agencies. By digitizing and securing crime reporting processes, the
system enhances investigative efficiency, improves inter-agency coordination, and promotes public
confidence in the justice system.
Key Words: Blockchain, Smart Contracts, Decentralized System, Digital Evidence Management,
Cybersecu ri ty
Technology Used:
Solidity (Smart Contracts), Qorum "Ethereum
Based Blockchain", React.js (Frontend), Node.js
/ Express.js (Backend), MetaMask (Blockchain
Integration), MongoDB, Web3.js
Supervisor Name:
Dr. Syed Qaiser Ali Shah
Group Members:
Abdul Moiz Qureshi (i22 - 2640)
Abdul Hannan (i22 - 2441)
Minahil Asif (i22 - 2710)
FAST NUCES ISLAMABAD CAMPUS

ILM-ORA
The ILM-ORA is developed to assist students in navigating their academic and professional futures
through intelligent data-driven insights. There are two views of this app-Student View and Ad min
View - the former is for students to utilize features such as the Holland Code (RIASEC) based
personality assessment, machine learning based degree recommendations, and a comprehensive
database of Pakistani universities in Islamabad. Users can query university information, explore
career insights with salary data, and utilize sentiment analysis on university reviews in natural
language. The application also includes specialized modules for scholarship discovery and hostel
finding. The latter view is for the admin, who manages the underlying datasets far universities and
careers, ensuring the recommendation engine remains accurate and up to date.
System Design:
• Microservices Architecture: Built with a scalable backend using Node.js, Python, and FastAPI
to handle high-concurrency requests.
• Dynamic Data Management: Administrative controls for updating career insights,
scholarships, and university listings.
Features include:
• Career and Degree Guidance: Includes RIASEC-based assessments and smart degree
suggestions tailored to student profiles.
• University Exploration: Search and comparison of institutions featuring sentiment analysis
of student reviews.
• Student Support Services: Integrated scholarship finder and student accommodation
(hostel) discovery tools.
Key Words: Microservices, Machine Learning, React, NLP, Career Guidance, Students, Universities.
,-:-.. ILM ORA ~--
l~J =,~~--
1111:elllge111. ll'l..ecomn,e:•l1on Systetn
I
MOTIVATION:
• Empowering the Next Gencrat1on
• Sus~csdng lntcr-mcdl.:ltc & A-level
students Bachelors Deerees and
unive,.sities based on thei,. inte,·est.
I
CORE SYSTEM MODULES:
KEY FEATURES
& SUPPORT
Technology Used:
React, Tailwind CSS, Node.js, FastAPI,
MongoDB, Vs Code
Supervisor Name:
Ms. Nigar Azhar Butt
I
TIMELINE:
Group Members:
Taimoor Raza Asif {i22-2659)
_. .. ..,...:. - •==-=-=- •==·=<&
-=--·- ar::.:..
--.::=..-· (>- Muhammad Abdullah Ghani {i22-2683)
I
TECHNOLOGY STACK:
.. Hamza Aftab {i22-2523)
FAST NUCES ISLAMABAD CAMPUS

OSXplorer - Gamified OS Learning Platform
OSXplorer is a gamified Learning Management System (LMS) engineered with Next.js and Phaser.js
to bridge the gap between abstract Operating Systems theory and practical application. By
simulating core concepts like CPU Scheduling, Memory Management, and Process Synchronization
in real-time, the platform compels students to solve unique, randomized algorithmic challenges
rather than memorize patterns. This interactive environment leverages game mechanics, including
XP, streaks, and leaderboards to significantly boost student engagement and foster deep technical
intuition, delivering a modern, effective alternative to static educational tools.
Features include:
• Interactive Modules: Playable simulations for CPU Scheduling, Memory Management, and
Process Synchronization.
• Dynamic Logic: Randomized variables ensure no two problem sessions are alike.
• Gamification Engine: XP, Badges, and Streaks to drive user retention.
• Visual Feedback: Real-time Gantt charts and memory grids for immediate understanding.
• Leaderboards: Competitive ranking system to motivate peer learning.
Key Words: Gamification, Operating Systems, Simulation, EdTech, Next.js
Technology Used:
Next.js, Typescript, Phaser.js, MongoDB,
Node.js, Express.js
Supervisor Name:
Ms. Laiba lmran
Group Members:
Abdullah Daoud (i22 - 2626)
Usman Ali (i22 - 2725)
Faizan Rasheed (i22 - 2734)
FAST NUCES ISLAMABAD CAMPUS

lntegrow
An Al-driven desktop application automating the complete software development lifecycle from
requirements to deployment. Users write natural language requirements which are analyzed by a
multi-agent Al system running in parallel. A real-time WebSocket-powered Al chat assistant
enables requirement refinement. Approved requirements automatically generate structured user
stories, UML class diagrams, and code using LLM-powered generation. The platform also features
automated Al code review, intelligent test generation with coverage analysis, technical debt
scanning, and deployment readiness gating. All artifacts are version-controlled through built-in
GitHub integration.
Features include:
Multi-agent Al requirement analysis detecting ambiguities and completeness gaps
Real-time Al chat for iterative requirement refinement and User story generation with acceptance criteria
UML diagram generation with visualization and LLM-driven code generation from UML diagrams
Al code review with quality scoring
Automated test generation with coverage analysis. Deployment gating with Docker/Cl-CD config generation
GitHub OAuth with automated version-controlled commits
Key Words: Multi-Agent Al Systems, Large Language Models (LLMs), Requirements Engineering, Automated Software
Testing, SDLC Automation
lnteGrow
To automate the transition from natural language requirements to
deployable code through a mul:i-agent Al ecosystem.
Features
| M ul tl • A ~ 1 1 t  | Al ct. ., t Aubt. . nl  |     |                    |     |     |
| -------------------- | ----------------------- | --- | ------------------ | --- | --- |
| A n a l ys i 'i      |                         |     | One Click Ot:ploy  |     |     |
r>v,'i<fl'•-
Workflow
Technology Used:
Python, FastAPI, Next.js, React, Electron,
Typescript, Tailwind CSS, Supabase,
Supervisor Name:
| Timeline                             |                               | Toiili     |                                         | Dr. Muhammad Bilal  |        |
| ------------------------------------ | ----------------------------- | ---------- | --------------------------------------- | ------------------- | ------ |
| S E P - O C T                        | J AN-FE B                     |            |                                         | Group Members:      |        |
| ~~M~a le e~ .  f9 q .·.. ~. ,:_:~H,  | ······,·L~I~i  ~ ~ an.d: ij.  | •  1\l=XT- | ..  {i;> ",  supabase                   |                     |        |
|                                      |                               |            |                                         | Shuja Uddin (i22 -  | 2553)  |
| NOV~                                 | EC  MARCH-APflll              |            |                                         | Amna Hassan (i22 -  | 8759)  |
| NC~. ..I                             | T~!•lo!...ii~•                |            |                                         |                     |        |
| agenu.                               | Ck>Co.tnen'"eton              |            | M u , b n  T : u i q  u i- i . 6 o 1 .  |                     |        |
Supcn·hor;  s· n ij : i U d J i u   , 4 i ; " '> 'H   Muskan Tariq (i22 - 2602)
|     |     | Dr•  .'.\'luh~mnutl Bila!  | ,,rnna H,usln l~l-6n'J  |     |     |
| --- | --- | -------------------------- | ----------------------- | --- | --- |

FAST NUCES ISLAMABAD CAMPUS

ORICALO
ORICALO, The Urdu-Native Voice Agent for Real Estate Marketing in Pakistan is an Al powered
conversational platform designed to modernize property search and customer engagement. It
enables users to interact naturally in Urdu through voice, providing real time property
recommendations, price estimations, and booking assistance.
The system consists of two main components. The Customer Interface supports intelligent voice
interaction powered by Speech Recognition (ASR), Large Language Models (LLM), and Retrieval
Augmented Generation (RAG) for accurate, context aware responses grounded in real property
data. The backend handles property dataset ingestion, vector database indexing, and Machine
Learning based price prediction, ensuring scalability and continuously improving performance.
Features include:
• Urdu voice based property search
• Semantic property recommendations using RAG
• ML based real estate price estimation
• Context aware conversational dialogue
• Booking and lead qualification support
• Continuous dataset updates and re indexing
Key Words: Artificial Intelligence, Conversational Al, Speech Recognition (ASR), Retrieval-Augmented
Generation (RAG). Real Estate Analytics
Technology Used:
Python, React, PyTorch ,Gemini, Tensorflow,
ChromaDB, FastAPI, Twilio
Supervisor Name:
Dr. Ahmed Raza Shahid
Group Members:
Sumeed Jawad Kanwar(i22 - 2651)
Huzaifa Mehmood (i22 - 2669)
Abdul Rafay (i22 - 8762)
FAST NUCES ISLAMABAD CAMPUS

Graph Aware Test Repair Tool
Graph Aware Test Repair Tool is being developed, keeping the perspective of software developers
and DevOps teams working in modern Cl/CD environments. There are two core components of
this system - Repair Engine View and Graph & Validation View - the former is responsible for
automatically detecting failing tests, analyzing repository-wide dependencies, retrieving
contextual information through a Repository Knowledge Graph, and generating semantically
consistent test repairs using Graph-based Retrieval-Augmented Generation (Graph RAG) in natural
language-driven code reasoning. If in any case the generated repair does not pass validation or
fails to preserve intended semantics, the system logs the failure context and forwards it to the
feedback and improvement pipeline. The latter component manages the repository knowledge
graph, validates repair correctness (syntactic, behavioral, and semantic validation), and updates
the graph after successful repairs to ensure continuous learning and improvement.
Features include:
•  Repository-level analysis including functions, classes, dependencies, documentation,
commits, and issue references.
•  Graph-based Retrieval-Augmented Generation (GraphRAG) for multi-hop contextual
reasoning.
•  Automated test repair with syntactic, behavioral, and semantic validation.
•  Incremental graph updates after each commit.
•  Logging failed repairs and integrating feedback for continuous improvement.
Key Words:
Automated Test Repair, Graph-Based Reasoning, Repository Knowledge Graph, Retrieval-
Augmented Generation (RAG), Large Language Models
e
National. Un.lversi.ty o.f Computer and Emergi.ng S0.1cnoc:s
|                       |     | nt=ipArnnent of comp1n11,sr - |     |              | T81Arn&bAd  |                                      |     |     |
| --------------------- | --- | ----------------------------- | --- | ------------ | ----------- | ------------------------------------ | --- | --- |
| C' •,c:: 1--_::. :-,  |     | -:. r F ~;::                  |     | ,,n"Z' , _,  | r>.F ••     | ,.._ 1r,.rv1~,.., -.-.,              |     |     |
|                       | >'  |                               | •   | '  1         | '           | 11...1 • Ct.'U"'"IJ.Ull~,1 Ct1(:1.h  |     |     |
Graph Avvare Te•t Repai.r Tool (GATeR)
1"3. r:,ow<;.'f"O(I r<lPoOilorv ,._,.,..., ot,torno.tod wn n;,p"'lr o;y.u,n,
Ovorutovv1
QATeA (Qrp.ph-Aw"re T•1.t A&P$1r) 1.s " cont.ext-~ automated t••t
| repa:i.r fra,nevvork thD.t uses repositor-y  |     |     |     | level knowledge grnphs to fi)I(  |     |     |     |     |
| -------------------------------------------- | --- | --- | --- | -------------------------------- | --- | --- | --- | --- |
br-0~1, teat.s J.nt.all!.gently. c,y comb11-.i.ng grapt,-ba.aed retrieval with
LLMr., it enr.uror. r.em::i,nt!.c:illy co~ist.ent 3nc:I cc::i,1.:,.ble rop::iirc.
\No~lavu
·;~
|     |     | ! _ |     | ~  ~-- | •   | - -~ - |     |     |
| --- | --- | --- | --- | ------ | --- | ------ | --- | --- |
~-
,_,
| ...  |     | I ______ - |     | -   | - - |     |     |     |
| ---- | --- | ---------- | --- | --- | --- | --- | --- | --- |
Technology Used:
| -·-- |     |      | ~-- |           | I   |     |                                            |     |
| ---- | --- | ---- | --- | --------- | --- | --- | ------------------------------------------ | --- |
| ~    |     | ~":  |     | ~ -__ 4b  |     |     | Python, Tree-Sitter, Kuzu Graph Database,  |     |
LanceDB, LLM, Github OAuth
|     | Syotom Mod"1..,,•  |     |     |     |     | Tooh-Staok  |     | Supervisor Name:  |
| --- | ------------------ | --- | --- | --- | --- | ----------- | --- | ----------------- |
-
|     |     |     | p!ij  |     | Iii:  | Luncc Db  |     | Mr. SamiUllah Shah  |
| --- | --- | --- | ----- | --- | ----- | --------- | --- | ------------------- |
pa
Python na.sk
|     |     |     |     |     | -a:- |     |     | Group Members:  |
| --- | --- | --- | --- | --- | ---- | --- | --- | --------------- |
Tensorflow
Broph Builder  F la i tt V W -. 0 8   G 1 a . o h R A G   Dawood Hussain (i22 -2410)
|       | Soo | r l n g   M | o d u lo  | A o t r i o v o r  | @   |            |                          |     |
| ----- | --- | ----------- | --------- | ------------------ | --- | ---------- | ------------------------ | --- |
| Bl:I  |     |             |           |                    |     | 01thub     |                          |     |
|       |     |             |           |                    | •   | K1..1zuDb  | Ahsan Faraz (i22 -8791)  |     |
Doopoook
Mirza Mukarram (i22 -2488)

FAST NUCES ISLAMABAD CAMPUS

RECRUTO - Al-Powered HR Recruitment & Automation System
RECRUTO is an Al-powered end-to-end HR recruitment and automation system that streamlines the
entire hiring pipeline - from job posting to final candidate recommendation. It auto-posts jobs
across multiple platforms, parses CVs from Gmail and Google Forms using NLP, and highlights skill
gaps on a structured dashboard. LLM-generated MCQs and coding challenges are delivered via a
secure portal with consent-first proctoring. Al models analyze interview recordings to extract
behavioral insights, while a dual-calendar scheduling module handles interview bookings. A
composite scoring engine then aggregates all results to generate transparent, ranked candidate
recommendations.
Key Features:
-Automated job posting across Linkedln, Indeed, and company portals with role-specific templates.
NLP-based CV parsing with skill-gap highlighting {missing skills in red, extra skills in green)
LLM-generated MCQs and Al-evaluated coding challenges with anti-cheating proctoring
Al behavioral insights extraction from interview recordings (confidence, tone, body language).
Composite scoring and transparent candidate recommendation engine with adjustable
weightings.
Key Words: Al Recruitment, NLP, Large Language Models, HR Automation, Behavioral Analytics
Technology Used:
FastAPI, React.js / Next.js, Python
(ML/DL/NLP), OpenAI / LLM APls, MySQL,
Firebase, AWS S3
Google Calendar API, Twilio (SMS)
Supervisor Name:
Dr. Asif Muhammad Malik
Group Members:
Ayesha Khalid {i22 - 2678)
Badar Faisal {i22 - 2507)
Sabeeh Dayyan {i22 - 2732)
FAST NUCES ISLAMABAD CAMPUS

Flexi Store
FlexiStore is a peer-to-peer storage marketplace app built for SMEs, e-commerce businesses, and
property owners. The app has four views - Renter View, Owner View, Courier View, and Admin
View. Renters can search and book nearby storage spaces, compare courier rates, and manage
payments. Owners can list their idle spaces, set pricing, and monitor their warehouse via Al-
powered CCTV and loT sensors. Couriers can manage delivery orders and access optimized routes.
Features include:
- Al-driven warehouse monitoring: including CCTV surveillance, fire/smoke detection, intrusion
alerts, PPE compliance, loT sensors, and predictive maintenance.
- Route optimisation: Shortest path routing, congestion scoring, and location analytics.
- Smart search & booking: Voice/text search with flexible weekly or monthly slots.
- Courier integration including API connections with major couriers, a manual panel for local
couriers, rate comparison, and real-time shipment tracking.
- Payments and contracts including dynamic pricing, demand forecasting, PayFast escrow, and
blockchain-hashed automated rental agreements.
Keywords: Peer-to-Peer Storage Marketplace, Al Warehouse Monitoring, Geospatial Route
Optimisation, Blockchain Smart Contracts, Sharing Economy Logistics
Technology Used:
Python, Next js, Node js, Postgre SQL, PayFast
Supervisor Name:
Dr. Shahela Saif
Group Members:
Muhammad Hamdan Rauf (i22 - 2561)
Abdullah llyas (i22 -2677)
Muhammad Usman Toseef (i22 - 2562)
FAST NUCES ISLAMABAD CAMPUS

GreenCode Al
GreenCode Al is an Al-powered sustainable code analysis tool that optimizes software for energy
efficiency, maintainability, and performance. It integrates into the developer workflow through a
VS Code extension and Cl/CD pipelines, analyzing code using AST and CFG models. A multi-agent
review system detects inefficient patterns such as redundant logic, high CPU usage, deep loop
nesting, and performance bottlenecks.
The tool provides real-time, context-aware optimization and risk-aware refactoring suggestions
inside the IDE. A Context Memory module ensures safe modifications by tracking method
relationships and call graphs.
By supporting automated pull request analysis and reducing computational overhead, GreenCode
Al promotes eco-conscious and sustainable software development.
Features include:
• Real-time code analysis through VS Code extension
• Detection of inefficient loops, redundant logic, and resource-heavy operations
• Multi-agent Al review (Optimization, Maintainability, Compliance)
• Risk-aware refactoring suggestions
• Cl/CD integration for automated project-wide analysis
• Context Memory for safe code modifications
Sustainable coding insights to reduce digital carbon footprint
r"'..""'-.,.
i Supervised By
................ D,. Atlf Aft Ab Ahm9d Jll$nl
D
GreenCode Al
Multi-Agent Sustainable Code Optimization
Make Software Faster. smarter. Greener.
ln b •la o A l,u n t . a , t t • y •~ :r a • b a a t n n• d d.. o . ..- p ,.,c t . l t ~u m M i2 a! e '•O co lt d t•o 4i a N f k D • b r..e c .,n t N - . i .. : -I . t , K , y 1 • 1 • m f ,a f r i a u < t f l n • p n u r c c lr y u 1 . n a d b o k e t 1 t • 1 e a ; c y u t o U p u a e · l o r f ~ l t o a a b r h m l A e a • l n • -d f c t e r w l " a '• r " e
enafn.erlrtC
r---------------~
!
I
RIH'ACTOtllNG lo
ll!:COMMll!NOATION
ENGINE
Code
I
INTEGRATION&. ANALYTICS I
@ •--I Technology Used:
,111
V$ COCM DctfflNOfl C.l/:.~:!- JS,TypeScript, Next.js, Node.js, Python,Go,
S:eatu res:
Docker,VS Code Api
Supervisor Name:
Dr. Atif Aftab Ahmed Jilani
Project Team:
Group Members:
Sajad Ahmed - 22k-482&
Zahra lrfan - 221-15'3 Sajad Ahmed (22k-4826)
Salf-Ur-Rehman - 221-87911
Tool• & T<>Chnologles Zahra lrfan (22i-1543)
Saif-Ur-Rehman (22i-8799)
FAST NUCES ISLAMABAD CAMPUS

Al-Powered Admission Support & Career Guidance Platform
Talk2FAST is an Al-based chatbot application developed to assist students with admission
guidance, academic queries, and career counseling while considering both student and academic
management perspectives. The system consists of two main modules: Student View and Admin
View. In the Student View, users interact with the chat bot using natural language or voice to
receive instant information about admission criteria, degree programs, merit calculation, mock
tests, university policies, and career guidance. If the chat bot fails to provide a satisfactory
response, students can submit their queries through a feedback option. The Ad min View allows
administrators to review unanswered or incorrect queries and update accurate responses. These
updates improve the system's dataset and enhance future chatbot performance.
Features include:
•  Al-based academic and admission-related queries
•  Degree program and eligibility guidance
•  Merit criteria and policy information
•  Al-powered career counseling module
•  Mock test platform for entry preparation
•  Voice interaction module (Speech-to-Text & Text-to-Speech}
•  Sending failed queries to ad min panel
•  Dataset updated after ad min answers the query
Let us unfold power of data
Features
Al Admission Chatbot
01
Instant rosponsos for admission
related quries
02  Career Counseling
| Al-based guidanc  |     | based on student  |     |     |     | Technology Used:  |
| ----------------- | --- | ----------------- | --- | --- | --- | ----------------- |
interests & skills
React Native, Node.js, Python, MongoDB,
03  Mock Test Platform
Entry test preparation with performance  WebRTC, Ollama, Github, Docker
analytics
|     | Career lnalghta  |     | Al Chatbot Engine  |     |     | Supervisor Name:  |
| --- | ---------------- | --- | ------------------ | --- | --- | ----------------- |
Pnudi;,!io ...u11tmt
|                                                    | ,~u'1try lr1>nds anrl  |      | Instant ex>ntex.t-aware responses  to MTmlS!UOf"I JINt 8CR.1P.mtc  |                  |                          |                          |
| -------------------------------------------------- | ---------------------- | ---- | ------------------------------------------------------------------ | ---------------- | ------------------------ | ------------------------ |
|                                                    | aalaty (Gl,yt,S        |      | qJOM•                                                              |                  | Dr. Muhammad Asif Naeem  |                          |
|                                                    | M•<• ,_,               | ••~  | - ••••••••• G••'-•<•                                               |                  |                          | Group Members:           |
|                                                    | Platform               |      | E yit:> 11,                                                        | merit.           |                          |                          |
| \vitt-3,tnfrulterl~ng  Ent')' lttst pntpan1111CW1  |                        |      | a:lrra                                                             | Kn proce~t.ei..  |                          |                          |
|                                                    |                        |      | a1dpo1cy1normff1on                                                 |                  |                          | Tayyab Attiq (22i-2554)  |
|                                                    | llrd f9ed~             |      | 111111111"""  A'8 1na1ant1y A,/81 Able                             |                  |                          |                          |
|                                                    | Enable Voice           |      | Career                                                             |                  |                          |                          |
Muhammad Haris Khan (22i-2673)
|     | Interaction      |                           | Recommendatfon                |                                           |     |     |
| --- | ---------------- | ------------------------- | ----------------------------- | ----------------------------------------- | --- | --- |
|     | Vo&ee m oo u & e |  ( S T T   T T S )        | A l   I V I. J u l tt   - . . | ,  1 1 9 1 : :1 M S  ~ l ut d t .r lt ll  |     |     |
|     | A ll c w •       |  h a n ; i s - f r .  .   | d f t Q r e r .   p r o g r   | a m s   t> a s e d   o n                  |     |     |
l, ' l te r a c t r e , n   , ~ t •r e s t   • n d   I l k  f l a   Hamza Arshad (22i-1126)

FAST NUCES ISLAMABAD CAMPUS

AutoValid
AutoValid is an Al-driven automated testing framework designed to revolutionize Black-Box
Testing for dynamic Single Page Applications (SPAs). Addressing the limitations of manual script
writing and low test coverage, the system empowers QA engineers to simply input test scenarios
in Natural Language (User Stories). The core engine utilizes NLP to interpret these stories, driving
an intelligent Exploration Engine that navigates the application and builds a dynamic State-Flow
Graph to track unique pages. To ensure deep validation, the Context Detection Module
autonomously infers field types (e.g., distinguishing emails from dates), enabling the Data
Generator to synthesize context-aware datasets-including boundary values and malicious
inputs-to test system robustness against edge cases. The Execution Engine then emulates real
user behavior by handling dynamic waits and complex workflow branching to ensure stable
automation. Finally, the Bug Detector continuously monitors for runtime crashes and logical
errors, automatically generating Code Coverage Heatmaps and traceability reports that link bugs
directly back to user stories, eliminating the need for manual testing.
Key Words: Automated Exploratory Testing, Natural Language Processing (NLP), Black-Box Testing,
Playwright Automation, State-Flow Graph, Software Test Automation ,acceptance test automation .
.,,
Auto valid
Automates black-box testing by exploring web apps and
generating context-aware test data without manual effort.
Workffow Joo!i
. '($-
Input Exploration Context ..,. fastText Technology Used:
Layer Engine Detector 0
>(I
! Python, Node.js, Playwright, Neo4j, MongoDB,
--y -
NLP, ClickHouse, Docker, React.js.
&if +- ~ +- ~j
l]IFaker @l Supervisor Name:
Bug Execution Data
Detector Engine Generator Dr. Atif Aftab Ahmed Jilani
Timeline
Group Members:
Ubaid Ur Rehman (221-1541)
Hassan (221-2705)
Manal Shahid (221-8801)
I Ii -L'IMl!.n (221-2705)
Supervisor Df. Arif Aftab Mmacl J lani Members Ubaiu 1.11 Rehmall (22i·l.541)
Manni Shahid (221-8901)
FAST NUCES ISLAMABAD CAMPUS

Nature's Wrath
Nature's Wrath is a 2.5D pixel-based anti-survival game that redefines the traditional survival
genre by reversing player roles. Instead of the human player struggling to survive, an Al-controlled
agent takes on the role of the survivor, while the player manipulates the environment to eliminate
it.
The Al agent is designed to gather resources, craft tools, manage survival stats such as health and
hunger, and adapt dynamically using reinforcement learning techniques. It explores diverse
biomes, combats hostile mobs, and responds strategically to environmental threats.
Meanwhile, the player operates from a bird's-eye perspective and influences the world by
triggering natural disasters, spawning enemies, and escalating difficulty over time. This creates a
dynamic and evolving interaction between human strategy and machine learning adaptability.
Developed in Unity using C#, the project integrates Al systems, procedural world generation,
combat mechanics, and crafting systems within a structured modular architecture.
Nature's Wrath aims to explore adaptive Al behavior in interactive environments while delivering
an engaging and strategic gameplay experience that emphasizes experimentation, challenge, and
replayability.
,.....,o,_ p~
_ .... -... ..!!»~~
NATURES
WRATH
MOTIYATION OBJECTIYES
.t ~ Q H E L A D l T U E C IC £ I N M A ;P P$ L A¥ .~ <ilE r H o E t R r tlT N IO A N P
.OQEOICTMLE
EtENY BEHAYJOR
.LDUTEO
ou:r1cuL, v
~SSJ:WI .QPTD'IIZEO GANE
,t D A < I Q C M I I D \ P IE T f H I l Y ) R G E A A ,.., I , - ,PLAY • P fHTT E CXHC ~ I OQ C j Technology Used:
C# Unity, Visual Studio
TECH STACK
cs, Supervisor Name:
Ms. Nigar Azha r Butt
• ·- Rosou1co
Gathering
Grouo Members:
'\ ,7'
AISurvivor NEC C H O A R N E J :CS Crafting Yahya Rashid Chughtai (i22 - 1413)
\i •
.!. Environment./ ..,ob$ Muhammad Fahad lmran (i22 - 2404)
Control
SYSTEM DESIGN Muneeb Ur Rehman (i22 -2702)
l l
FAST NUCES ISLAMABAD CAMPUS

Reqify- Intelligent Requirements Quality Assurance Platform
Reqify is an Al-powered web-based platform that automates the classification and quality
assurance of software requirements within the SDLC. It accepts requirement documents and
processes them through a seven-module pipeline. The Pattern-Based Requirement Extractor
parses the document, while the Requirement Categorizer classifies requirements into functional
and non-functional types, mapping NFRs to quality attributes. The Ambiguity Detector performs
binary ambiguity classification and multi-type scoring using transformer-based models. The
Completeness Checker uses a multi-strategy NLP approach to evaluate requirement coverage. The
Conflict and Consistency Analyzer uses Sentence Transformers for pairwise semantic comparison,
while the Prioritization Advisor generates a hybrid priority list refined by ambiguity and conflict
scores. The Change Impact Analyzer simulates ripple effects through dependency graph
visualization, and Risk Estimator aggregates scores into a comprehensive Risk Index.
Features include:
- FR/NFR classification, ambiguity detection, completeness evaluation, and conflict detection
-Change impact simulation, hybrid prioritization, and risk estimation
Key Words: Requirements Engineering, Natural Language Processing, MERN Stack, Model Training,
Text Classification Techniques
#"'""'-.,.,
{<iLJ j National University of Computer and Emerging Sciences
'•11n•t#'
Reqify
t
r
(
I
~
uel~c
w
ls
e r
c
e
:t
d
m b
r
i
e
g
q
u
u
ili
i
t
r
"
e
S
m
c
e
1
n
nd
t s
c
a
o
s
n
s
f
u
li
r
c
e
t
.
s
n
.
e e-
p 1
p
io
la
r
t
il
f
i
o
£
r
e
m
s.
t
a
h
n
a
a
t
l y
c
l
a
e
t
s
e g
d
o
1a
ri
11
z
g
e
e
+~ ,
+
l
-
lmpacc, and asses.ses .r is,s to ensure hlgh·cuality requirements.
- - c.·",- ~
lJo;,pr l11put JleqUr-ement Al Anatyzer qe,port Generation
i
Technology Used:
Process Flow MERN Stack, Python, Hugging Face
Transformers, spaCv, NLP, Visual Studio Code
Supervisor Name:
£)(1 • ., Dr. Ahmad Raza Shahid
Roadmap
Group Members:
Samra Saleem (i22 - 2727)
Abdul Ahad (i22 - 2500)
Cr.Alu S o u • 1> d 1 f r t v M ts • o r 5 hilhhl O C r o . • S S ll o a p l @ lel ' a V S ko a r i f - .. . . t. . l.l . - 1 . ,1 . .1. . .1 . , . _. ,,... ...,.~ _ I.Z, , , . ,-. , - , _. . . . . ' ..
FAST NUCES ISLAMABAD CAMPUS

Q&Ace - Al interviewer
Q&Ace is an Al-powered virtual interviewer application that helps students and job candidates
prepare for real-world interviews through a realistic and interactive simulation environment. The
system is designed to build confidence, improve communication skills, and provide constructive
feedback. Users participate in Al-driven mock interviews using natural voice interaction. The Al asks
relevant questions, analyzes responses, evaluates communication skills, detects vocal cues and
emotions, and generates performance-based feedback. It also identifies weak areas and helps users
focus on topics they lack in for targeted improvement.
The platform delivers fair, unbiased, and personalized insights without human intervention. The
goal is to create a hyper-realistic, accessible, and cost-effective interview preparation system that
is fast, fair, and free.
Features include:
• Al-powered real-time interview simulation.
• Voice-based interaction with speech-to-text and text-to-speech.
• Emotion and communication skill analysis.
• Intelligent, performance-based feedback.
• Personalized recommendations for weak areas.
• Low-latency real-time conversational flow.
Technology Used:
Llama 3.3, Groq, Qwen TIS, Wav2Vec2,
MediaPipe, LivePortrait, WebRTC, FastAPI.
Supervisor Name:
Dr. Behjat Zuhaira
Group Members:
Abdullah Jamil (22i-2435)
Aziq Rauf (22i -2367)
Shamil Sajjad (22i -2451)
FAST NUCES ISLAMABAD CAMPUS

CasaBelle
CasaBelle is a blockchain and Al based real estate platform featuring a Client Web App and a Society
Web App. The  Client  portal enables owners, investors, and tenants to manage  listings, trade
fractional shares, and process digital rent. To ensure security, the system uses Al to verify the
registered societies via the CDA website and recommend properties through sentiment analysis.
Features include:
•  Property tokenization and fractional share.
•  Buying and selling properties through smart contracts.
•  Digital rent payments.
•  Recommendation of Properties using Sentiment Analysis
•  Rent distribution among co-owners using smart contracts.
•  All property transactions are permanently recorded on the blockchain.
Key  Words:  Blockchain  Tokenization,  Smart  Contracts,  Fractional  Ownership,  Al  Verification,
Sentiment Analysis.
C-p~--
Sy.c:I AN H--n C,lla,,.1
(»'•XO?)
| CasaBelle  | V&alram SaMd (221•2seot  |     |
| ---------- | ------------------------ | --- |
ODaoklUUll'I (Z21·15ZIJ
| A s e c u re  A l   • n d   ~ o c . k c h a ln - ba | s e d   s y st  ,•.m,, tfo r pro~rty  |     |
| --------------------------------------------------- | ------------------------------------- | --- |
| ~ , . . h i p ,  f r •e t l o n a l  l n v e tt m   | . n t .  • l '\d                      |     |
dia-t,ibvtion uainv ••n•rt controcta.
| Problem                                     | SOiution                       |                           |
| ------------------------------------------- | ------------------------------ | ------------------------- |
| -' Proponyft.M.Jd ;:md                      | c;,, lmrnutobh: bkxkc;:T'laln  |                           |
| dus:ilk:m.e owncrs:hli,                     | based ownership led;er         |                           |
| o  tA 3 n U .I   d o c u r n o n t.".ltion  | o S . C u r •  p r c r :,      | e n ;y  t e & <• n1 :r.0  |
| ; J1 r d w r l fl ci it 1 0 < 1             | at  i o n  w i t h   u         | n i q u e   0 5           |
| UmltOO ao:ess to                            | A.I po.verea soomy             |                           |
| hactional !~me,n                            | '-'9rificaLl~,,                |                           |
| o O.layud and dicputed                      | On-Chain Aent Oin,ibudon       |                           |
| te""lt dlsttlbutlon                         | MechaniMTI                     |                           |
System Overview
Technology Used:
Node.js, React.js, Solidity, Python, VS Code
Supervisor Name:
T-tln9a.
O.ptoyrn•l'lt
| 9   |     | - C V C O                                |
| --- | --- | ---------------------------------------- |
|     |     | , D l oc ;. lcc ;h,,I"  Ms. Laiba lmran  |
a.p,1oym-,,~
| Block.chain&.  |     | 6   |
| -------------- | --- | --- |
Front.nd ~.-tup
Group Members:
| • ~ ! H t  U : n t , . .c : ts   | • l l : n ll l t ~ e , g r a a t l c 1 > n n   &AI  | - .; J V n / t ~         |
| -------------------------------- | --------------------------------------------------- | ------------------------ |
| - U !/ U l .:  &                 | S e' nI )t -i m, e n t                              | 4 d ,  l ter 11 1 d on   |
l m p f e m o , n 1 ,: 1~ lo n   · " • ~   Usairam Saeed {i22-2580)
Technology Stack
Syed Ali Hassan {i22-2607)
Obaid Ullah {i22-1521)

FAST NUCES ISLAMABAD CAMPUS

DataChain: A Verifiable Dataset Marketplace using Blockchain & Al
Agents
DataChain is a decentralized verifiable dataset marketplace designed to establish trust, transparency, and
automation in data exchange. Existing data marketplaces are mostly centralized and suffer from critical
issues such as lack of provenance, data tampering risks, unfair dispute resolution, and limited privacy
guarantees. These challenges create significant barriers for organizations and researchers who rely on high-
quality and trustworthy datasets for Al and analytics.
DataChain addresses these problems by integrating blockchain technology with autonomous Al agents to
create a trustless environment for secure data transactions. The platform enables dataset providers to
register and monetize their data while allowing buyers to verify dataset quality and authenticity before
purchase. Smart contracts ensure immutable provenance tracking and automated escrow payments,
eliminJting the need for third-party intermediJries.
The system is composed of four major modules:
• Blockchain Core: Smart contracts for dataset registry, escrow payments, and reputation
management deployed on Polygon testnet.
• Al Agent Suite: Curator, Evaluator, and Arbitrator agents for structural validation, quality scoring,
and automated dispute resolution.
• Web Application: A React.js dashboard providing wallet integration, dataset browsing, and real-time
status updates.
• Privacy & Utility Module: Zero-Knowledge Proof (ZKP) based compliance verification and synthetic
dataset generation for safe testing.
Key Features
• Decentralized dataset registration with immutable on-chain provenance
• Secure IPFS-based dataset storage
• Automated Al-powered dataset validation and scoring
• Smart contract escrow for trustless payments
• Privacy-preserving compliance using Zero-Knowledge Proofs
• Algorithmic dispute resolution via Arbitrator Agent
• Real-time verification updates using WebSockets
• On-chain reputation system with staking support
• Synthetic dataset generator using ML techniques
Keywords
Blockchain, Smart Contracts, Al Agents, Zero-Knowledge Proofs, IPFS
Technology Used:
datachain
Blockchain - Solidity, Hardhat, OpenZeppelin,
Polygon Testnet, Ethers.js/Web3.js; Al &
a veritable dataset marketplace using blockhain and ui agents
Machine Learning - Python (Flask), Pandas,
.UCHITECTUk[
Sci kit-learn, ZoKrates, PyTorch/TensorFlow;
Frontend - React.js, Tailwind CSS, MetaMask
Integration, Socket.io; Storage - IPFS, Pinata,
MongoDB, Redis; Testing -
flMELH Hardhat/Chai/Mocha, Pytest, Jest, Slither.
ITUIATIONl IIIMUO~ 2 OWTION 1 rrwnow 3 nUATtoff J Supervisor Name:
S(PT.QCT20'H NCN-Dl'Cltl'S NOY-Cl:C X,2S Ft:a.M.U 1CtK l MAY 201'
Ms. Hina Binte Haq
ro=
'
o
i
L
f
S
® e
TtA MMIMBERS
Group Members:
~..!:"'
':,..IIOI
Muhammad Taha (i22 - 2544)
Mujtaba Khan (i22 - 2412)
FAST NUCES ISLAMABAD CAMPUS

SAFE DRIVE-Al
SafeDriveAI is a cross-platform mobile app focused on driver safety and road accident prevention.
It integrates a Real-Time Monitoring View with a Backend Management System. The application
uses camera-based Al  to track fatigue indicators like eye closure, yawning and head  nodding,
triggering debounced audio-visual alerts. Drivers can dismiss warnings through voice commands
and engage with a chatbot to remain engaged during long journeys. Additionally, the system
suggests  rest  stops  using GPS  and automatically shares the driver's location with emergency
contacts if severe drowsiness is detected.
Features include:
Real-Time Facial Analysis: Monitors eye closure, yawning, and head movements via camera.
Escalating Alert System: Progressive audio-visual warnings with false-positive filtering.
Hands-Free Control: Voice-activated system for hands-free alert dismissal.
Interactive Chatbot: Voice-based engagement to keep drivers alert on long trips.
Rest & Wellness Module: GPS-based rest stop suggestions and stretching exercises.
Emergency Module: Automatic GPS location sharing for severe drowsiness detection.
Key Words: Driver Drowsiness, Computer Vision, React Native, Real-Time Analysis, Road Safety, Android
,
...
,,,.__
| g\, ~ .,., ... l   | SafeDrive Al  |     |     |     |     |     |
| ------------------ | ------------- | --- | --- | --- | --- | --- |
J

Al that detects fatigue before it becomes fatal
FAST NUCl!S
1$LAIIAIIAD
0  Architecture
Rec~~~]
[f
|                 | 'f!'!,, Ml Kil Face  |     | =a        |     |     |     |
| --------------- | -------------------- | --- | --------- | --- | --- | --- |
| DR eact Native  |                      |     | Firebase  |     |     |     |
| App             | ,W, Detection        |     | Bockend   |     |     |     |
Cloudinary
•  Storage
*
Key Features
Technology Used:
Android, React Native, Typescript, Machine
| D IO w s i n e ss   | Smart Alerts  |     | Voice commends  |     |     |     |
| ------------------- | ------------- | --- | --------------- | --- | --- | --- |
D et e c t io n   Rest Stops  Learning Kit (Face Detection), Firebase,
Cloud Storage, GPS, Voice Recognition APls
0 Projectlimeline
| I sept-oct-1  |          | -0  |          | -   | I        | Supervisor Name:  |
| ------------- | -------- | --- | -------- | --- | -------- | ----------------- |
|               | Nov-Dec  |     | Jan-Feb  |     | Mar-Apr  |                   |
Mr. Junaid Ali Khan
| Face 0.tection,       | fKe Detecl!on,  |     | Rt,t Stops,  |             | Preclictlv• Module,                |     |
| --------------------- | --------------- | --- | ------------ | ----------- | ---------------------------------- | --- |
| O a t •~ • s e   I L  | 0at0NS• &       |     | V oi ce      |  C h at ,   | A n a ly t lc : s '  l n s ig h ts |     |
,g1
Al 't h m t le a t l o n.  Syste m  O p ti m l u tion  I n te g r a t i on  &   T e st lr Group Members:
)t Tools & Technologles
Hashim Ahmad (i22 - 2478)
| React Native  | (ffl  TypeSCript)  |             | (M..  Ml Kit) | / tr' Node.js) (  |           |     |
| ------------- | ------------------ | ----------- | ------------- | ----------------- | --------- | --- |
|               |                    | Firetx7ie'  |               |                   | An<tokl)  |     |
Shoukat Khan (i22 -8784)
| T  I 11 I I•  |     | "   | <.  |     |     |     |
| ------------- | --- | --- | --- | --- | --- | --- |
• < n t  r   A , r -, a d  T .l - l1 1 8   \Ii Junaid A~ Kha  Or 8f'~µl 2t1~ara  Ali Haider (i22 - 2443)
~ a: 11 1 t, 1  , ; n . ,  t ti  ~ 7 5 4
AJ~,16-"41

FAST NUCES ISLAMABAD CAMPUS

HOMEEASE -A Smart Home Services Provider App
HomeEase is a smart home services platform connecting homeowners with verified local
professionals for household tasks including plumbing, electrical repairs, and cleaning. The app
features three interfaces: Customer Mobile App for service search and booking, Service Provider
Mobile App for managing services and appointments, and Admin Web Dashboard for platform
oversight. Customers search services with intelligent filters, book appointments, make payments,
and track service status. Providers manage profiles, availability, and earnings while
accepting/rejecting bookings. Administrators verify providers, resolve complaints, and generate
analytics reports. The platform integrates Al-powered chatbot for natural language assistance,
abusive review detection, and personalized service recommendations.
Features include:
• Service-related queries including categories, pricing, provider details, and booking policies
• Real-time booking status tracking with confirmed, in-progress, and completed service updates
• Al-powered chatbot for natural language customer assistance and troubleshooting
• Feedback escalation to admin panel for chatbot failures or unsatisfactory responses
• Dynamic knowledge base updated by admin after resolving escalated queries
• Key Words: RESTful API, Al Chatbot, MongoDB, React Native, Payment Integration
Technology Used:
React Native, Node.js, Express.js, MongoDB
Atlas, JWT Authentication, Stripe API, Firebase
Cloud Messaging, AWS EC2, Jest Testing
Framework
Supervisor Name:
Ms. Laiba lmran
Group Members:
Usama Jamshed (i222499)
Sameer Tariq (i221512)
Musab bin Ubaid (i222708)
FAST NUCES ISLAMABAD CAMPUS

ZEHNOVA
ZEHNOVA is an Al powered progressive reading and audio book platform developed to enhance
accessibility and comprehension for visually impaired individuals and general readers. The system
provides an interactive reading environment where users can read, listen, ask questions, and test
their understanding of books in real time.
The Reader View enables users to upload books in formats such as PDF and EPUB. The system
automatically processes the content through a structured ingestion pipeline that cleans text, detects
chapters, extracts metadata, and prepares it for reading. Users can begin reading instantly through
progressive streaming, while their reading position and preferences such as font size, spacing, and
theme are saved and restored across sessions.
The Interactive Learning View enhances engagement through an Al powered Book Brain. Users can
ask contextual questions about characters and events, generate smart summaries, and create
quizzes based on recently read content. The system uses hybrid intelligence combining semantic
search, vector embeddings, and a Neo4j knowledge graph, with MongoDB fallback retrieval when
required. Performance results and progress are reflected in a personalized dashboard.
The backend architecture is built for scalability and efficiency. A FastAPI core handles API requests,
while Redis and RQ manage background tasks including parsing, embedding, graph construction,
and text to speech generation. Audio is synthesized through a high qualityTTS engine and stored on
AWS S3, and WebSocket streaming enables real time progressive reading and interaction.
Features Includes:
• Multi format book upload and automated content processing
• Progressive streaming reader with persistent state management
• Context aware question answering using hybrid search and knowledge graph
• Smart chapter and book summaries
• Interactive quiz generation and learning analytics dashboard
• Text to speech narration with synchronized audio playback
• Secure authentication and user data isolation
• Scalable cloud deployment with background processing architecture
Key Words: Artificial Intelligence, Knowledge Graph, Progressive Web Application, Natural
Language Processing, Accessibility Technology
Z EHNOVA ::
An Intelligent Al Reading and Learning Platform ,
Technology Used:
React SPA, FastAPI, MongoDB, Neo4j, Redis
and RQ, Qdrant Vector Database, AWS S3,
GraphO.tllbaM
• Read5 I St.imrnarlz• 1O tlh:: Kokoro TTS, WebSocket Streaming, Node JS
TIMELINE
Supervisor Name:
Dr. lsma UI Hassan
Group Members:
Muhammad Ahmad (22L-7869)
September October Nowmber Oectmber febru,,ry AprU
Moreh
TOOLS&TEAM
Muhammad Haassan (221-2573)
<ffi,O FastAPI f Neo4j. Su.,..vbor Or. l>fflti UI Hl930n
Group Memben.
~ RQ C\drant M Afna ~ n A Ra t (. Y qa n t; 3 22 d 1 l • 2 24 L 3 7 7 8 60 Afnan Rafaqat (221-2437)
Muhaml'Nld MNSsan 221-2573
FAST NUCES ISLAMABAD CAMPUS

SEOmation
SEOmation is an Al-driven content generation and SEO optimization platform designed to solve
the fragmentation and affordability problem faced by small content creators. Instead of using
multiple separate tools for keyword research, drafting, SEO checks, and publishing; SEOmation
provides a unified workflow from ideation content creation SEO publishing.
The system includes a full web application (content creation, platform integrations, scheduling, and
media management) and a browser extension that provides portable on-page SEO tools across any
website.
Features include:
Al-generated topic ideas based on business niche/keywords (save/regenerate options)
SEO-ready blog generation (structured headings, meta suggestions, clean formatting)
Linkedln & lnstagram post generation (platform-aware variants+ formatting)
Image generation for posts with basic resizing support for platforms
Publishing & scheduling (publish instantly or schedule for later)
Browser Extension SEO Audit: on-page checks (meta, headings, keyword density, alt-text, links)
along with Competitor comparison and PDF export of SEO audit/report
Key Words: Al Content Generation, Search Engine Optimization (SEO), Browser Extension, Social Media
Publishing
SEOMATION
An Al-powered platform to generate SEO-optimized content,
automate publish Ing, and audit websites all In one place.
ARCHITECTURE
--
SEOmation
-=-cm:19
User
-·
----,
, Technology Used:
I \
Browser Extension •
l C.,. ... > I React, Node.js, PostgreSQL, Qdrant Vector DB,
EHilH:P+i+iiiii-Ei:iihii·I::& (1me1r......JI
II ...,._...._,,,. I Groq LLM API, FastAPI, Chrome Extension
l-~-
'-----~'I
(Manifest V3)
TIMELINE
Supervisor Name:
S•ep-- Oct No•v-De c Ja • n-Fe b Mo•r-Ap r Moy • -Jun
Dr. Asif Muhammad Malik
Requirements Bockend Frcntand Tnting& 09ploymenl Group Members:
& Design & Al Dev & Extension 1n1egrotlon &Demo
Syed lbraheem (22i-2666)
TOOLS TEAM MEMBERS
22i-2666 Syed lbraheem Abdul Rafay (22i-8785)
22i·8786 AbdulRafay
22i-8781 lbrohim Ahmad
Ibrahim Ahmad (22i-8781)
SUPERVISOR
Or Asif Muhammad Malik
FAST NUCES ISLAMABAD CAMPUS

AdaptiveWeb
AdaptiveWeb is an Al-powered website optimization platform designed to help developers
improve user experience using behavioral data. It provides two main interfaces, Developer
Dashboard and Admin Panel, where developers can track user interactions, view Al-generated
optimization suggestions, and approve or reject changes through a visual editor. The Admin Panel
allows administrators to manage system settings, website registrations, and Al processes. The
system uses machine learning to analyze user behavior and generate smart recommendations for
better performance and engagement.
Features include:
•
Automatic tracking of user interactions through a simple SDK integration .
•  Al-based behavioral analysis and segmentation .
•
Al-generated component variant suggestions .
•  Visual editor for testing and approving changes and performance comparison .
Key Words: Website Optimization, Machine Learning, Web Analytics, React, Next.js, PostgreSQL
e
.
Adaptive Web
Al-Powered Website Optirnirntior Pla:f:nn
-
Su pervisor: Ur. M1,thtn1ma•:t ~•ol
Group Members:
• SI.Hid l<h!Wl ?7i-?577
• J:,veria k"fan 22i-2GSG
| -   | I   |     |     |
| --- | --- | --- | --- |
 u • ~ •
| W e t,i t n   l e c t tritelli,:ent reeHi"'e behe'do·el  |     | A d a : : , ,t v e W e c ,   u n 9 ' A l   J V L   l o • ~ • ' y ;;•                              |     |
| -------------------------------------------------------- | --- | ------------------------------------------------------------------------------------------------- | --- |
| o p, t,m i z a t, o n                                    |     | b t ~ v o ,o i o d . , _ . l;Q I T T ( l t .. .. . ,l y t : . , - . , , . 1, < .> p 1 ,n il:.,ll  |     |
|                                                          |     | L l lv , m n t s   f c , r   b e t t e H • r « • g a o m e n t                                    |     |
-
-
|                     | -                           | -     |     |
| ------------------- | --------------------------- | ----- | --- |
|                     | ,,..,,.()1:.1,,             | -     |     |
| - Ole-•.;,·,;~ • .  |                             | li J  |     |
| •                   | ,.,~: n.,,- ·~Hlll'lll:S J  |       |     |
| f>-~-30.:           | 9•  :P::~l!.".1,l"'OIU.~    |       |     |
lo>)~  ~Jfl,~ll ----=~~. •
Technology Used:
--~i
Typescript, React, Next.js, NestJS, Prisma ORM,
!N.~!XSI.I.S~Ollll  ,,..:.,,.:l,<iop~tlN~ T9T.  °"<Cj~H••~I,O.,d..N...,H....',. .,  PostgreSQL, Python, Docker, OpenAI API, Vite
| -             |     | m'" ~•  | Supervisor Name:    |
| ------------- | --- | ------- | ------------------- |
| ( PhCIHl-Reu- | 0   |         | Dr. Muhammad Bilal  |
nrffl&,~lnrY'li"'.)
| •Q -~(~ | ~ "  ' " ' "' )    | Tfpi,Script  React  .tffl.xlj1   |                 |
| ------- | ------------------ | -------------------------------- | --------------- |
| -       | £ .Tr ac: h in:J   |                                  | Group Members:  |
1, b  ()
Saad Khan (i22-2527)
"
| @-0  |     | Ne,IJS  Prisma  "'"  |     |
| ---- | --- | -------------------- | --- |
PhoSO<I-Ul.4
|                               | lnt,grattcn  | " r'  | Javeria lrfan (i22-2696)  |
| ----------------------------- | ------------ | ----- | ------------------------- |
| ("'°&'V·o'lid-o"tic'",n "') - | -~,,         |       |                           |
~$tyr~SQI.  Pytho11  0U1:hir

FAST NUCES ISLAMABAD CAMPUS

Auto Fiver
Al Gig Optimizer is an Al-powered browser extension designed to assist freelancers in optimizing
their service listings (gigs) on online marketplaces, with current scope limited to Fiverr. The system
automates  gig  performance  analysis  and  provides  intelligent  recommendations  to  improve
visibility, engagement, and conversion rates.
The system integrates a Chrome Extension with a Supabase backend and an Al engine (Llama 3) to
analyse  gig  titles,  descriptions,  keywords,  pricing,  and  performance  metrics.  It  provides
optimization suggestions, competitor analysis,  keyword recommendations,  scam  detection for
buyer briefs, and real-time analytics tracking.
The solution follows a  modular architecture where each  feature operates  independently yet
communicates through a centralized backend. Additionally, performance logs are secured using
block chain-based hashing to ensure transparency and tamper-proof evaluation of optimization
results.
The system is designed for freelancers seeking data-driven improvements and aims to enhance gig
ranking, buyer engagement, and overall marketplace competitiveness.
Dataset updated after admin answers the query.
Key Words: Artificial Intelligence, Gig Optimization, Chrome Extension, Supabase, Block chain Verification
E) AutC1>FiVerr E)
To help F1.1err sellers opt1m1ze their 919s, detect scams, and outperperform
| competitors using Al - | all from a Chrcme lxtense Chrome Extension.  |                  |     |     |     |
| ---------------------- | -------------------------------------------- | ---------------- | --- | --- | --- |
| I  ARCHITECTURE        |                                              | I  KEY FEATURES  |     |     |     |
Smart Gig Optimizer
1\1r ewrites tides, clescrlpUons &
pricing fOf mavlmum conv~slons
|     | 0,.,  | -- Keyword Engine  |     |     |     |
| --- | ----- | ------------------ | --- | --- | --- |
Recommends S high-traffic SEO
|     | FastAPI Server  | tAQ! via se>manuc gap •nalysts  |     |     |     |
| --- | --------------- | ------------------------------- | --- | --- | --- |
AneslSfCQUCSllOfl
cnt-1,;err
Llama-3 +
- Technology Used:
|     | LangChain  | -   |     |     |     |
| --- | ---------- | --- | --- | --- | --- |
Al QPunizatlOtl  ""''"
JavaScript, Supabase, Lia MA 3, Rest APls,
Blockchain
Competitor
Radar
Supervisor Name:
| I  WORKFLOW Tl MELINE  |     | Live Chrome Eiccnsion lntsfK)e  |     |     |     |
| ---------------------- | --- | ------------------------------- | --- | --- | --- |
Mr. lrfan Ullah
-
Group Members:
~=
Dtct:m~:~:=:m:a, .-,
|          |       |               | Tt:mg~:,emtnt  | Hateem Khush Bakht (22i - | 2691)  |
| -------- | ----- | ------------- | -------------- | ------------------------- | ------ |
| I TOOLS  |       |               | &~             |                           |        |
| ,.  0    | r-:i  | I             |                |                           |        |
|          | '\.&  | TEAM MEMBERS  |                |                           |        |
Abdu1Raffay(22i-2546)
|                      | La~Chaln  | Hateem Khush Bakht -         | 221-2691  |                     |        |
| -------------------- | --------- | ---------------------------- | --------- | ------------------- | ------ |
| Pytt1on  FastAPI     | Ollama    | Abdul Raffay -               | 221-2664  |                     |        |
| ft                   | 4lfr      |                              |           |                     |        |
| JS                   |           | Ahmed Masood -               | 221-2704  | Ahmed Masood (22i - | 2704)  |
| .JavaSc1lpt  Ch1ome  | Supabasa  | Supervisor: Mr. lrfan Ullan  |           |                     |        |

FAST NUCES ISLAMABAD CAMPUS

Al-Powered Remote Workforce Management System (Prodexa)
Prodexa is an AI-powered remote workforce management system designed to balance organizational
transparency with employee privacy. There are distinct views in this app Employee View, Manager View,
and Admin View. The Employee view is for users to log work sessions, view task progress, communicate via
team chat, and enforce their own privacy through settings like "blackout mode" and automatic blurring of
sensitive information. The Manager and Admin views are designed for oversight, allowing leadership to
manage projects via Kanban boards, monitor real-time activity, and oversee automated payroll. If a manager
needs specific productivity or attendance data, they can bypass complex dashboards by asking the Smart
Query Engine a question in natural language (e.g., English). Furthermore, the system runs local AI analysis
to detect fraudulent activities, like mouse jigglers, ensuring accurate tracking without invasive surveillance.
Features include:
• Privacy-first monitoring with client-side sensitive data blurring and blackout modes for personal
applications.
• AI-driven fraud detection to identify anomalous behavior and simulated inputs.
• Smart Query Engine for retrieving work history, analytics, and project summaries via natural
language interactions.
• Unified task and project management utilizing Kanban-style boards.
• Integrated team communication supporting real-time chat and secure file sharing.
• Automated payroll processing and comprehensive analytics dashboards for attendance and
productivity trends.
Key Words: Remote Workforce Management, AI Fraud Detection, Privacy-Preserving Monitoring, Smart
Query Engine, Microservices Architecture.
Technology Used:
Node.js, Express, React.js, Electron.js,
MongoDB, AWS (S3, SES, SNS), Python
O Tesseract , Llama
Supervisor Name:
Dr. Shahela Saif
Mr. Zaheer ul Hussain Sani)
Group Members:
Afnan Hassan (221-0991)
Atif Ibrahim Abbasi (221-1249)
Muhammad Ghaus (221-2564)
FAST NUCES ISLAMABAD CAMPUS

BluePrint Al - Al-Driven AWS Cloud Infrastructure Planner
Blueprint Al is an intelligent system designed to help developers and organizations plan their AWS cloud
infrastructure more easily and efficiently. In modern software development, cloud platforms such as Amazon
Web Services (AWS) provide many services that can be combined to build scalable and reliable systems.
However, selecting the right services and designing efficient cloud architecture can be challenging, especially
for developers who do not have extensive experience with cloud technologies.
Many developers face difficulty in choosing the appropriate cloud services, designing scalable system
architectures, and estimating the cost of the infrastructure before deployment. This project aims to simplify
that process by providing an Al-assisted platform that recommends suitable cloud architecture based on
user requirements.
In this system, users describe their project ideas and requirements in simple natural language. The system
analyzes these requirements and suggests suitable AWS cloud architecture that can support the project
effectively.
The recommended architecture is displayed visually in a diagram editor using standard AWS service icons.
This visual representation allows users to clearly understand how their system should be structured. The
platform also provides flexibility by allowing users to modify the suggested architecture if they want to add,
remove, or replace specific cloud services according to their needs. In addition, the system estimates the
approximate cost of the cloud infrastructure so users can understand the financial impact of their design
choices. Whenever the architecture changes, the estimated cost updates dynamically.
Another important feature of the system is automated deployment support. The platform allows users to
automatically deploy the recommended cloud architecture, enabling faster and more reliable infrastructure
setup on AWS.
Major features include:
1. Al-based recommendation of AWS cloud architecture based on project requirements
2. Visual representation of the recommended architecture using an interactive diagram editor
3. Ability for users to modify and customize the architecture design
4. Dynamic estimation of infrastructure cost based on selected cloud services
5. Automated deployment of recommended AWS architecture
Key Words: Artificial Intelligence, Cloud Computing, AWS, Terraform, Cloud Architecture Design
r:iouama
mongoDB
Project Ouerulew m ..
BluePrint Al is an end-to-end, web-based assistant awi -.-
dosignod to ompowor students and non-c.cports to Terraform ""
plan end build complex cloud architectu,es with
ease. Beyond visual planning. the platform supports
outo deployment ond conf1gurot1on of ows services.
WorkFIOW
Technology Used:
Python, React JS, Node JS, LangChain, Hugging Face,
Requirement Archllecture Cost EUlmouon Deplo1men1
Gathfr1na Re<ommendatlon AWS, Terraform, Mango DB, Visual Studio, Ollama
Tho'-lehatbot Theengltle Thermen• hp.rtk.11rr1
l .. t 1 h tr e 1 u c s t e sw r l 1 o t h ml " te ee h d H s U to H r m.; ~ ,tehUU t $ o 0 f' lu 1 lO pp dc li , c ,p •l l l ( : l > y r $ " ~ lc 1 n ', e Supervisor Name:
t~trlCt project opt1m,nd AWS opt1m1leG -'HS IINS using
i<)a~ ,c,..,11:e pol.terns M1Mc1 paner,,5. Terrafol"T\
Ms. Laiba lmran
Tlmelme
Group Members:
Kashan Abbas (221-2728)
flllNOlleAGUH llt•ll. .1 1<1'0 IN,..t111t(turtet -•·-••U Anas Mubashar (221-2581)
rlHn1l1IMIO'la (INN(lat) ••• 1,.-11,
• PC,v,)4op,cd • 01..-1110ped • IQff'af()rM • ""' &. Pn)JKI
ch1tbot Nttll11ctur1 Olploymtint. M1n1&1ment. Ahtezaz Ahsan (221-2046)
• D(:,ycloped R«ommor,00< • AWS • Depto,,.,.,ni. &
lnt1r1t1IIHI • Coll li:allmatlon Comp.c1b,lty tut n&-
D,ogrom f:<hti;H [Ill nu
FAST NUCES ISLAMABAD CAMPUS

Check Mate
CheckMate is an Al-powered academic LMS platform built to simplify how teachers and students
handle assessments. It is designed to automate the heavy lifting of the academic lifecycle by
allowing teachers to generate quizzes or exams and use Al to automatically grade submissions,
whether they are text-based essays, complex math problems, or programming code and also allow
teachers to scan students' digital or handwritten work. Students use the app to receive instant
Al-driven feedback, and progress analytics to see where they can improve.
Features include:
• Al-driven grading for textual, mathematical, and programming-based assessments.
• Automated assessment generation from teacher-provided source materials and topics.
• Plagiarism and similarity detection across student submissions and external sources.
• Comprehensive analytics dashboards for tracking student performance and weak areas.
• Feedback loop for grade re-evaluation and manual teacher intervention.
Key Words: Large Language Models (LLMs), Automated Grading, Optical Character Recognition
(OCR), Retrieval-Augmented Generation (RAG), Educational Analytics.
.OleckMate
..l.l-waM.c-Dmill allliBllltCUll'IIIIIII
Features
~)
c:::=) ¤->w~
a
@
C"'=-r:...l
Technology Used:
Workflow
React, ExpressJS, Supabase, Flask, Python,
Ollama, React Native, NodeJS, React Native
Supervisor Name:
Mr. Zaheer ul Hussain Sani
+ Tec hnologies Used Group Members:
Il-l -@ @ ex -F1I Muhammad Affan Wajid (i22- 2567)
Muhammad Taha Makhdoom (i22 - 1547)
Ahmed Saeed (i22 - 2445)
FAST NUCES ISLAMABAD CAMPUS

Roomora
The proposed system is an Augmented Reality (AR) based mobile application designed to enhance
the online furniture shopping experience. Traditional e-commerce platforms rely on static images,
making it difficult for customers to judge how furniture will look or fit in their homes, often leading
to uncertainty, dissatisfaction, and even product returns. This application allows users to place
virtual furniture in their real spaces using AR, enabling them to evaluate size, color, placement,
and overall aesthetics before making a purchase. Users can view items from different angles and
experiment with various configurations, helping them make more confident buying decisions. The
system also supports businesses by allowing them to manage digital catalogs, upload realistic 3D
models of their products, and organize them for customers to explore. The application is
structured into three modules: a Customer Module for browsing and visualizing items in personal
spaces, an AR Visualization Module for interactive placement and realistic testing of furniture, and
an Admin/Business Module for managing catalogs, updating models, and ensuring accurate
product representation.
Key Words: Augmented Reality, 3D Modeling, AR Visualization, Mobile Application, E-commerce.
Technology Used:
Flutter, Python, Flutter arkit_plugin, Firebase,
YOLO, COLMAP, Nvidia instant-ngp NeRF
Supervisor Name:
Dr lsma ul Hassan
Group Members:
Muhammad Bin Tariq (i22-8761)
Muhammad Zunair (i22-2729)
Muhammad Abdullah Iqbal (i22-2504)
FAST NUCES ISLAMABAD CAMPUS

Splash
Splash is an Al-enabled influencer marketing and collaboration platform that connects brands with
pertinent social media influencers while streamlining campaign management. The entire process
is automated instead of laborious manual labour. Influencers and brands undergo an onboarding
process  where  profile  information,  engagement  metrics,  and  campaign  requirements  are
collected. The platform then recommends suitable influencer-brand partnerships using intelligent
matching  based  on  metrics  such  as  niche,  audience  demographics,  campaign  goals,  and
engagement  quality.  Splash  also  facilitates campaign collaboration through secure messaging,
supported by a Conversation Intelligence Assistant module that enhances interactions between
brands and influencers, along with Al-generated marketing creatives. In addition, analytics tools
track campaign performance and engagement allowing for real-time updates and response.
| Features of Splash - | Al Influencer Marketing Platform  |     |     |     |     |     |
| -------------------- | --------------------------------- | --- | --- | --- | --- | --- |
•  Influencer Discovery and Profile Onboarding
•  Al-Driven Recommendation System
•  Al Creative Generation for Campaign Content
•  Secure Campaign Collaboration and Messaging
•  Conversation Intelligence Assistant
•  Analytics and Performance Tracking
•  Integrated Payment and Transaction Handling
Key Words: Artificial Intelligence (Al), Recommendation Systems, Retrieval-Augmented Generation
(RAG), Natural Language Processing (NLP).
Technology Used:
Supervisor
Mr. Junaid Ali Khan
,22 ',L,O Muhammad Tabish
i222538 Emama Noor
·222555 Haroon Waheed
SPL~SH
Next.js
Al Powered Brand -lnfluen,er Collaboration Platform
React
| On-boarding  | rh•Oieeow-ry  |     | E'<ecut..on  |     |     |              |
| ------------ | ------------- | --- | ------------ | --- | --- | ------------ |
| Woricflo·N$  | Eng:ne        |     | "gEnt5       |     |     | Drizzle ORM  |
ii\
|     |     |     | /~  |     |     | Neon  |
| --- | --- | --- | --- | --- | --- | ----- |
-
Dlitu~tt...~•~  c,11m1Q1"1Br;e1  -(~)- i\1.1.dGM.trat•M  PostgreSQL
W!J  7
| ... ..,.           |       |            |               |             |     | Zod         |
| ------------------ | ----- | ---------- | ------------- | ----------- | --- | ----------- |
| ,..., ,-,::;,.,.,, |       |            |               |             |     |             |
| •                  |   IA  |            | Enc-y~edC"it  | Anel:,,ica  |     |             |
| 111nuenctr         |       | Shu"d      |               | """'"'"     |     | Lucia Auth  |
|                    | 'T'   | Workspace  | 8             |             |     |             |
Go
Arcjet
...,,.
| Molfi<           | S"-«t!stn9  |     | DlllwaOOlt  |          |                |     |
| ---------------- | ----------- | --- | ----------- | -------- | -------------- | --- |
| Vt:11ri1,.1Huo1  |             |     | 4,;,,vv,11  | '""'"'"  | Google Gemini  |     |
n,oOi:SCOvary
| On boafdlng  'Noo,:nows  |                   |     | E•oc:u1lon  |     |                   |     |
| ------------------------ | ----------------- | --- | ----------- | --- | ----------------- | --- |
|                          | l!:ngne           |     | Agents      |     |                   |     |
|                          | Project Timeline  |     |             |     | Supervisor Name:  |     |
G
|                      | (9               | Cl)             | C,          |     |                      |     |
| -------------------- | ---------------- | --------------- | ----------- | --- | -------------------- | --- |
| Aug Sep              | Oct Nov -        | Feb Mar -       | A.pr May    |     | Mr. Junaid Ali Khan  |     |
| • 011:ta Scrapfng &  | • R«ommendaton   | • AIAd/Creatve  | • Frcn:end  |     |                      |     |
| Influencer D.ll:.3   | Syst~m De-.e~,t  | Gene~ Modl&"'   | Comoletion  |     |                      |     |
Group Members:
| Collectkw'I           | • C..mp.C1.ign Ch.--.t         | • Campaiin                             | • TleS.iog & Bua Fhma  |                  |     |     |
| --------------------- | ------------------------------ | -------------------------------------- | ---------------------- | ---------------- | --- | --- |
| •  In f lu e n c e r  | & ,.  C h o d . b ut  5 Y ~ to | : ,rn   C v t i .. t- ..u  , . . .  ,  | •  o« u m              | e nt a t iO " I  |     |     |
C > a !. h b ou d  Deslln  •  A n . a . . l y , t   i c s  o .  .. n  b o a rd  lm p ( O tE m e n t s   & , F n a l e > . p ~t  Muhammad Tabish (22i-1540)
Emama Noor (22i-2538)
Tools and Technologies
| GI * | ~ ~  |     |     |     |     |     |
| ---- | ---- | --- | --- | --- | --- | --- |
Haroon Waheed (22i-2565)

FAST NUCES ISLAMABAD CAMPUS

ScrumAI
ScrumAI is an intelligent sprint management tool designed to automate and optimize key aspects of
the Scrum process, making sprint planning and task allocation more efficient. The system uses
advanced Al techniques, such as Large Language Models (LLM) for task decomposition and BERT
embeddings for dependency detection. Additionally, ScrumAI integrates optimization algorithms,
such as Integer Linear Programming (ILP), for efficient sprint planning. It aims to automate user story
breakdown, detect dependencies, optimize sprint tasks, allocate tasks based on developer skills, and
provide real-time alerts for cascading delays.
Key Features:
User Story Management: Automatically converts high-level user stories into structured tasks and
subtasks.
Dependency Mapping: Uses Al (BERT embeddings) to detect and visualize dependencies between
tasks.
Smart Sprint Planner: Uses ILP to automatically generate optimized sprint backlogs based on task
priority, deadlines, and developer capacity.
Task Allocation  Helper:  Recommends optimal developer-task assignments  using Al-driven  skill
matching.
ScrumAI
Al powc,cd tool to .iutomotc ~rint plonnhg .:md monagc task dc,ocndcndc!;
Architecture
_
..
,U.. . -.,M.......U -$1.-, •
.:~•
Technology Used:
Python, LLM API, BERT, React.js, Node.js,
Key Features  PostgreSQL, Docker, Django REST Framework,
|             |              | 0             | u                          | Tailwind CSS  |
| ----------- | ------------ | ------------- | -------------------------- | ------------- |
| User Story  |              |               | Supervisor Name:           |               |
|             | D.pendonc:y  | Smart Sprint  | Task  Cascading            |               |
| Manager     | ~~per        | Pl.:anncr     | Allocation  Dcl:ay Alerts  |               |
Hel~r
Dr. Usman Habib
Timeline
Group Members:
| 0   |                       | - GI)  | -(D               |     |
| --- | --------------------- | ------ | ----------------- | --- |
|     | Aus-Sep - •  Oct-Dec  |        | Jan-Feb  Mar-Apr  |     |
•Dliltaubetling,  •  • Smart Sprint  • u ~etion  Malaika Rehman (i22 - 2605)
|     | • l.:tskAlocWCJn~,  | f>W'l1ef (fCC!l'lne'(t)  | • ~e-T'lll'IC.~  |     |
| --- | ------------------- | ------------------------ | ---------------- | --- |
• t.Mf Storie§ •
| TukC~  | •Sl""-ltSpi,1tf>wl•1CO  | •eo....,,Js'IOd.oyAk<b •To.il'l:l&F"wl  |        |     |
| ------ | ----------------------- | --------------------------------------- | ------ | --- |
|        | {nllbl)                 |                                         | Ooc:~  |     |
Rehab lmtiaz (i22 -8769)
|             | wit,   | -=-  | ~-:m:::~•~ . •s  >;~:~-; .., '                     |     |
| ----------- | ------ | ---- | -------------------------------------------------- | --- |
| ......1  •  | •      | (1'  |                                                    |     |
| 'C""        | "'4.]  |      | p . ,, ,, - , _,., ,  >  >I'•  (;" ~uP6""C' _.. .  |     |
'   ,   '   '   '  Uswa Zafar (i22 -8782)

FAST NUCES ISLAMABAD CAMPUS

ShifaMart+
ShifaMart+ is an Al-powered healthcare platform being developed to address critical challenges
in medical accessibility, affordability and transparency. It assists patients in early disease
prediction, prescription analysis, medicine price comparison, and emergency first-aid guidance.
The platform integrates four independent dashboards - Patient, Doctor, Pharmacy, and Ad min -
unified by an Al Agent Chatbot that serves as the central point of interaction. The Patient View
enables users to input symptoms far Al-Based disease prediction, upload prescription for analysis,
compare medicine prices and access emergency first-aid guidance. The Doctor Dashboard allows
medical professionals to manage their profiles, access patient's medical history, consult and write
e-prescriptians. The Pharmacy View enables registered pharmacies ta manage their inventory
and update medicine stock and prices. This creates a competitive marketplace for medicine price
comparison. The Admin Dashboard provides comprehensive system oversight, including user
management, pharmacy verification and platform analytics. The platform follows a microservices-
based architecture where Al services (disease prediction and prescription analysis) operate
independently and communicate via secure APls. The system emphasizes usability, performance,
reliability, and data security. Features Include:
• Al-based disease prediction from user-entered symptoms
• Prescription image upload with OCR and NLP-based medicine extraction
• Detection of duplicate medicines and possible interactions
• Medicine price comparison across pharmacy stores
• Pharmacy inventory and price management
• First-Aid Recommendation Module for emergency guidance
• Appointment booking and order management
Key Words: Al-Assisted Healthcare, Disease Prediction, Prescription Analysis (OCR/NLP), Medicine
Price Comparison, Microservices Architecture, Emergency First Aid Support
ShifaMart+
Sh,fa.'-klrt• 1$ cnAl-p:,wered healthaJl"l' platform be,ng develop«! tooddn.-ss critical choUm,ges 1n
rnn.Ucul o:cen..-t11Uti.,. of/ouJotiUt~ 01,d trwi:;port'ncy.
-
D E]
Technology Used:
' React JS, ExpressJS, NodeJS, MongoDB,
..
Python,
- - - -
Timtlilt TensorFlow, PyTorch
Supervisor Name:
,_
-
&~ uim Mrs. Rabail Zahid
.......,_,
loo ... .- llu<IUl1•«1d &o0.lio\'-9t., Group Members:
.... lllPtwt
,
Abdur Rafae (i22 -2638)
THIii Ml111hr1
t ,.
express S A y b e d d u r M R un a e fa e e b 2 K 2 0 1 2 -2 m 6 l 3 2 8 2 1-2680 Syed Muneeb Kazmi (i22 -2680)
•"'"ll" Atvned Javed 2 21-2461
6.,..= n•d~ s M . s , . 1 R n a l1 b a o r. l l Zahld Ahmed Javed (i22 - 2461)
FAST NUCES ISLAMABAD CAMPUS

SoleMate
The SoleMate app is being made while keeping the perspective of online shoe shoppers in Pakistan.
There is one view of this app, Try On View. This view is for online shoe shoppers, who will use the
features of our app to try on different shoes in augmented reality, get outfit recommendations based
on the shoe selected for try-on, and personalize shoe skins for customized orders.
Features include:
•  AR-based  real-time virtual  shoe try-on using Snap Lens, enabling realistic 3D shoe overlays
aligned  with  the  user's foot  movements through  computer vision (object  detection, foot
tracking) and Snap-powered motion tracking algorithms.
•  Outfit  matching  and  recommendation  engine  that  analyzes  the  user's  current  attire  by
extracting visual  features (e.g.,  color palettes) and  computing  similarity scores to suggest
complementary shoes and clothing items for cohesive styling.
•  A personalized shoe customization module allowing users to modify shoe attributes such as
color and patterns, with an instant augmented reality preview for an interactive and immersive
design experience.
Keywords: Augmented Reality (AR), Computer Vision, 3D Modeling, Recommendation Systems, and
Personalization.
@
Sup.rvl-,.or·  .... L."'"""''""""
I
| Project Title  |     |     | ~ Group Members:  h m ll d   1 1 1 : s r ,.. , .. _n |   l • l . l - L - . J I   |
| -------------- | --- | --- | ---------------------------------------------------- | ------------------------- |
| SoleMate       |     |     | . .. . .  Aunm r ue r," Ql O  U • ~ •< 1n            | •1  1 , . t   ~ • r 1 1   |
|                |     |     | M .   ~ ~                                            | ( ' l l . · L ~ 7 8 )     |
Univer:.ity N~e.;
| AR   P o w e    | r e d  V ir tu a l  S h | 0 4 !  T r y - O n |  &  C F SQ A S ne'n T f"c   ' N -.e'l .1 '. 1 ! t s! l '  o r A n ,  at.lr rU .r.o | r 11 lv :1f w '!U s   lty of  |
| --------------- | ----------------------- | ------------------ | ---------------------------------------------------------------------------------- | ----------------------------- |
| O u t fi t  R e | c o m m e n d a t io    | n   S y s ~ e m    | ci                                                                                 |                               |
Motivation
[&&
••!t~~. .  - - A<=
|                                | • Hard t.o match        |     | • Umite-d cu~tom-                 |     |
| ------------------------------ | ----------------------- | --- | --------------------------------- | --- |
| • ~~~~;::,tt7c:~!i             | !ihoc!i with outfit:;.  |     | mlzotlon option:i                 |     |
| AR Shoe Tl"}'·On               |                         |     | ShoeCuston1izatlon                |     |
| • Keat-time AN try-on          |                         |     | • Color custom1zat1on             |     |
| • Snap lens  • Foot t1ac:kinK  |                         |     | • AR preview  • Pattern edil111g  |     |
System Architecture--
o"•=!Ef.:J  Technolo
-•~o..c...~  Used:
|      | -~·•t::·.    | -}-..:.@ | 1/=~=-               |                                                     |
| ---- | ------------ | -------- | -------------------- | --------------------------------------------------- |
| --L  |              |          |                      | Python, Flutter, Android Studio, Katlin, Snap Lens  |
|      | ~~7i:!..!.~~ |          | tit':~  "'==Aliff J  |                                                     |
Studio,
M  T..-,~,:.:l<o<y  -•- ~-•  YOLOv8  Fashion  edia  Transformers  CLIP
Tee h noI  ogles
Mobile  Supervisor Name:
Al/ Comp!..lt41r
Vi~IQn  Ms. Laiba lmran
AR/3D
Grou  Members:
Ahmad Tashfeen (i22 -2490)
M. Ahmad Tariq (i22 -1534)
M. Umer Qureshi (i22 -2578)

FAST NUCES ISLAMABAD CAMPUS

|     | Mayvn - | Al-Powered Marketing Assistant  |     |
| --- | ------- | ------------------------------- | --- |
Mayvn is an Al-powered marketing assistant designed for startups, small businesses, and digital
entrepreneurs. It enables users to generate social media posts, ad copies, product descriptions,
and campaign  strategies. It provides suggestions for audience targeting, brand positioning, and
campaign improvement. If the output does not meet expectations, users can submit feedback to
improve future responses. The application has a User View and an Admin View. The User View
allows marketers to input business details and campaign goals to receive Al-generated content and
strategy recommendations. The Adm in View monitors system performance, reviews feedback, and
updates  prompts  or model  configurations.  Feedback  integration  ensures  continuous  system
improvement.
Features include:
-Content generation: social media, ads, product descriptions
-Campaign strategy and audience targeting suggestions
- Feedback system for output refinement
-Ad min controls for monitoring and updating prompts/models
-Continuous improvement through Al learning and structured refinement
Key Words: Al, Marketing Automation, NLP, Content Generation, LLMs
#.mayvn
Your Al-Powered Social Media Architect
Ma')Vn is a multimodal marketillQ platform that transforms raw
ideas and product imagerv into orchestrated, multi-platform
campaigns. It streamlines tt.e lifecycle of digital presence:
| from  initial  | strotc-gy  to  autonomous  | cngogcmcnt.       |     |
| -------------- | -------------------------- | ----------------- | --- |
|                | Brttnd Kit Scraper         | Ucorlnput &       |     |
|                | {personalilaticn)          | Visual Ingestion  |     |
Technolog  Used:
Next.js, FastAPI, Firebase
Su  ervisor Name:
Dr. Behjat Zuhaira
| Conn~t Acc;O',Jnt  | Crcotc with our models  | Campeiign             |     |
| ------------------ | ----------------------- | --------------------- | --- |
| to post &engage    | (lmc)ge "nd caption)    | Orchestration Enoine  |     |
Group Members:
Eman Khalid (i22 -2409)
Huzaifa lmran (i22 -1511)
| A3sistant (2417  | Anolyti<:slJos,cd  |     | Tamim Ahmad (i22 -2449)  |
| ---------------- | ------------------ | --- | ------------------------ |
| srn:1rtreplies)  | Feebrlek Loop      |     |                          |

FAST NUCES ISLAMABAD CAMPUS

Wearism - Al powered Fashion Assistant
Wearism is an Al-powered fashion assistance platform designed to help users make confident and
efficient clothing decisions through intelligent analysis and personalized recommendations. The
system addresses common challenges such as time spent choosing outfits, underutilized
wardrobes, and lack of styling guidance by acting as a digital personal stylist.
The platform integrates multiple modules, including image-based analysis (age, height with 3D
reconstruction, and clothing classification), an Al recommendation engine, a wardrobe
management system, a social fashion hub, and a vendor marketplace with a dedicated dashboard.
Together, these components create a connected ecosystem where users can analyze their
appearance, manage clothing items, receive styling suggestions, share looks socially, and
discover products from vendors.
Wearism is built using a scalable client-server architecture with machine learning models
deployed in the backend, ensuring efficient processing, secure data handling, and responsive user
interaction. The project demonstrates how computer vision, personalization algorithms, and
modern web technologies can be combined to enhance everyday fashion decision-making and
create a comprehensive digital styling experience.
Technologies Used:
YOLO, Computer Vision, Python, PyTorch,
Flask, Supabase, Docker
Supervisor Name:
Mr. Pir Sarni Ullah Shah
Group Members:
Zarnab Ali (i22-2417)
Mian Ghulam Husnain (22i-1537)
Abdullah Jilani (22i-2417)
FAST NUCES ISLAMABAD CAMPUS

Huda Al
HudaAI is an Al-powered Islamic learning platform made in collaboration with AI-Huda International. The idea behind
this project is to make their library of over 30,000 audio lectures easy to access and actually useful for people. The
platform has two sides - a mobile app for end users and an admin panel for AI-Huda scholars.
On the mobile .:ipp, users can browse .:ind listen to lectures, read .:ilong with tr.:mscripts th.:it .:ire in sync with the audio,
and tap on any line in the transcript to jump to that exact moment. Users can also ask questions in plain English or
Urdu and get answers that are linked back to verified Quranic Ayat, Hadith, and the exact lecture timestamps. There is
also a knowledge graph feature where users can select any Ayah or Hadith and see all the lectures that mention it. For
people who don't have time for long lectures, the app also shows short 30-120 second clips that are automatically
extracted from lectures.
On the ad min side, AI-Huda scholars review Al-generated transcripts before they go live. They can approve, reject, or
edit the transcripts and also validate extracted Islamic entities like Ayat and Hadith. This makes sure everything on the
platform is authentic and trustworthy
before any user sees it.
Features Include
- Browse and listen to Islamic lectures with synchronized, interactive transcripts
-Tap any transcript line to jump to that point in the audio
-Al transcription- reviewed and approved by AI-Huda scholars before going live
- Islamic Knowledge Graph - select any Ayah or Hadith and see all lectures that reference it
-Short-form content: Al extracts 30-120 second clips from long lectures, verified by scholars before publishing
-Ad min panel for expert review, transcript editing, entity validation, and content management
-Q&A chatbot: ask a question and get an answer backed by citations from Quran, Hadith, or verified lecture segments
Retrieval-Augmented Generation I Knowledge Graph I Speech-to-Text I Expert Review System I Short Form
Content
HudoAI-Al Poworad
1111111 1elomkl learning Plotfotm
Technology Used:
di ILi Flutter, Next.js, Python (FastAPI}, OpenAI Whisper, Google Gemini, PostgreSQL,
:~"'~'I;••.-;-•: .~.....-...=.._ , = .,.,. - ,_ ~ ,~. : ,, : _ : .. : .._ , \ . ,> t • . • = <. ::h~••-~""~~'"'~
•"'"ll"II"'""' ... ""-... ...... -,._~_...,,,_...,...,._.._, GraphDB, PineconeDB, RabbitMQ, Docker
__
" ... - .. · . ~ ... ,. · . · . · ,... ....,... ".... " ._ ,'.,". . _ ."... _ " . " ._. ' . _" ._.. ' ., · ... _ .... _._ "..'._ _ _. .. _ _ Su ervisor Name:
·._..._.- .,__-. _...._-..._..-.._...-_... -
... _____ ,_,., .,,,
.,., _,,,, Ms. Nigar Azhar
:.-::::.:..~::~~~.:.. Dr. Amna Basharat
- .... - _,,...._'"'M'O-.,IO<O:ll-
* Group Members:
Maham lmran (221-2733)
Hashir Ayaz (221-2407)
Vahya Qureshi (211-1682)
30,0001' 3 <2 30-120
c..=::.."!'!·:...~. .
_ ........ U-ml
Hoilwl,i,;,<UrUn
.,..,,.._4,~!l
FAST NUCES ISLAMABAD CAMPUS

Hyrecruit Al
Hyrecruit Al is an Al-powered recruitment automation system built to support recruitment agencies
in end-to-end automation and managing the full hiring lifecycle for both recruiters and candidates.
The platform is designed around multiple user perspectives, Candidate View and Recruiter View. In
Candidate View, applicants can apply to jobs as guest or registered users. In Recruiter View, hiring
teams can create job postings with custom fields, monitor applicant pipelines, and review Al-
powered candidate evaluations. The system combines CV parsing, semantic matching, automated
screening, and Al-driven interviews and analysis (emotion/confidence and response quality), along
with xAI, and real-time dashboard to improve speed, consistency, and decision transparency.
Features include:
• Completely automated end-to-end recruitment lifecycle.
• Dynamic job posting and custom application form generation.
• Candidate applications for both guest and authenticated users with email verification.
• Al-powered CV parsing and semantic matching for candidate-job fit scoring, and interview
intelligence using video/audio analysis for confidence and emotion indicators.
Key Words: End-to-End Recruitment Automation, Explainable Al (xAI), CV Parsing and Semantic Matching,
Al Interview, Analytics Dashboard, Saas, Cloud Platforms.
H V RECRUIT
I if f4 Mi*iiii\h I hlie PM
eupervlaor: Mr. lrf'an Ullah.
,
;
..
:
, .
:
.
.
,
~
., 1
-
o
-
-.
;
1
.
"
:
'
-
,
:
-v
:~
1n
~
w
~: .
f
:
t
:
v
;
n
~
i1,
~
,,.
;
,
;
,1
;
,
:
.,
~
,,
~
,
1
.
1
,
;
n
,':
,
t.
.
'-
l"
'~
>l
~
l-
,
'.
~
ll
~
!.
~
IA
~·;
l'
~
lt.
:
,
~
.,.
~
,-
~
no
:
"
:
l
.
r
·~
f'I
~
I
L :: ••1 4 .. ,:_L... . :2e2~•,~-a2,• e•~,
u~urut_u. und dnu.,-drlvo•·• f,lrlr11t do,:::l,.lon""
-- SM;;;·
Technology Used:
Next.js, Node.js, FastAPI, MongoDB, Librosa,
Gemini, Whisper
o •O•" :•' : •. -.'" ;,~ '.". '" :...-: -..~.. . , ~, u .~.- • .';_ " 1 • t .1> Supervisor Name:
Mr. lrfan Ullah
Group Members:
Faraz Hayder (i22 - 2687)
@
Usaid Afzal (i22 -8783)
------ '\ft,/hfsper
-----------------=--
FAST NUCES ISLAMABAD CAMPUS

FYPilot
FYPilot is an Al-Enhanced Final Year Project (FYP) Management System developed while keeping
the perspective of students, faculty members, and academic committee personnel. There are
multiple views of this app - Student Portal, Faculty Dashboard, and Committee/Ad min Interface.
The Student Portal is used for project registration, supervisor requests, team formation, submission
tracking, and real-time notifications. The Faculty Dashboard is used for supervision workflows,
proposal review, and rubric-based evaluations. The Committee/Admin Interface is used for
workflow control, panel management, and decision support.The system also includes Alpowered
modules to improve academic quality and transparency. A duplicate detection module uses
semantic similarity search to identify similar proposals at an early stage. A recommendation and
scoring layer supports better project-related decisions. An automated panel generation module
applies optimization constraints to form fair and balanced evaluation panels.
Features include:
• Complete FYP lifecycle management from registration to final evaluation.
• Multi-role access for Students, Faculty, Committee, and Admin.
• Al-powered duplicate proposal detection and similarity analysis.
• Al-assisted recommendation and project assessment support.
• Automated panel generation using constraint-based optimization.
• Rubric-based digital evaluation and progress tracking.
• Real-time notifications and centralized analytics support.
Key Words:
Artificial Intelligence I FYP Management I Duplicate Detection I Panel Optimization I Academic
Workflow Automation
Supervisor:
I.As. Nlgar A.ha, Bolt
Groep Members:
Aodulah (221-2515),
Al-Enhanced FVP Management z. ..h anNaziin(221·2M6).
System for FAST University .l.zmar Kadlif(221•7716)
Objectives
• Automate the complete FYP lifecycle.
• Provide Al-assisted decision support for supervision
and project analysis.
• Detect duplicate proposals at an early stage.
• Improve transpaiency through rubri<>based evaluation.
• Build a secure and scalable academic management
platfomn.
System Architecture Diagram
I[ 3=tJ [
Pre~~rtion o~ J ~,
! ........ ..., ..... !...,,. ., _!
Mi~i:'":-j [ e.-.;:r. ,j ~ •°"' Technology Used:
Ap~~:;ion J [
l
1r--l'- Al Prooea dab 1~1 React, Typescript, Vite, Tailwind CSS, Node.js,
AI l E a n y g e i r n e T- . 1( P S n co , r - in . g • l Express.js, PostgreSQL, Redis, Drizzle ORM,
Rudutal !wrhedata
Zod, FastAPI, FAISS, Sentence Transformers,
r- Scikit-learn, OR-Tools, Docker, PM2
I
lnEtxetg@rranti.aol n [ ='="'°F="U"X"/S="t"ud"=l'f"fl=t" "=~:::1_~_....:E:m·=ail. =.M.o..ti,f,i•c=a!~!! !l:'. I J Supervisor Name:
Layer L.::·
Key Features Ms. Nigar Azhar Butt
@
Group Members:
Abdullah (i22 - 2515)
Zeeshan Nazim (i22-2646))
Azmar Kashif (i22-2716)
FAST NUCES ISLAMABAD CAMPUS

Autotest Al
AutoTestAI is an intelligent, self-reliant black-box testing system designed to ensure the
reliability and usability of modern, dynamic web applications. Traditional testing tools often
struggle with state explosion and dynamic content rendering in Single-Page Applications
(SPAs), requiring heavy manual configuration. To solve this bottleneck, AutoTestAI utilizes
a multi-stage workflow integrating web crawling, graph-based modeling, Large Language
Models  (LLMs),  Retrieval-Augmented  Generation  (RAG),  and  Reinforcement  Learning
(RL).  The  system  autonomously  navigates  applications,  learns  UI  behavior,  and
generates, executes, and refines test cases entirely without needing source code access.
Features include:
•  Automated UI discovery and scanning of frontend interactive elements, including
asynchronous and dynamic content.
•  Graph-based state modeling to map navigation and UI states.
•  Intelligent baseline test case generation covering important user workflows and
edge cases.
•  Adaptive test execution using a Reinforcement Learning agent to prioritize paths
that maximize bug discovery.
Automated  Black-Box  Testing, Reinforcement  Learning, Large  Language
Key Words:
Models, Web Crawling, Graph Modeling.
e
Subtitle: To!~;~t!n~~!~11-driven black-box
| FAST-NUCES  | testing and bug fixing for dynamic web applications.  |     |     |     |     |     |     |     |
| ----------- | ----------------------------------------------------- | --- | --- | --- | --- | --- | --- | --- |
Architecture
|               | [@]  |     |     | f@  |                |     |     |     |
| ------------- | ---- | --- | --- | --- | -------------- | --- | --- | --- |
| Input/Action  |      |     |     |     | Output/Result  |     |     |     |
U~~!r.:;
d
Refi~p~:~n¢t~~
|     | ~¢  |     | Cyclical  |     | Exe~~~;~;-~;gs,  |     |     |     |
| --- | --- | --- | --------- | --- | ---------------- | --- | --- | --- |
|     |     |     | Al Core   |     | Bug Analytics,   |     |     |     |
end Code Fix
|     |     | Feedback &          | R.L A&ent      |     | Suggestion  |     |     |     |
| --- | --- | ------------------- | -------------- | --- | ----------- | --- | --- | --- |
|     |     |                     | Fix"-- A  -EM  | ti  |             |     |     |     |
|     |     | suwstJoMY -, e/ on  |                |     | -~-         |     |     |     |
Timellne
|        |     | De~  | Implementation, Tes~  | Integration~  |     |     |     | Technology Used:  |
| ------ | --- | ---- | --------------------- | ------------- | --- | --- | --- | ----------------- |
| '"Ph~  |     |      | ~                     | T:l           |     |     |     |                   |
Phase2:  Phase4:  1  Python 3.11.5, Playwright, NetworkX, Google
Test case
| ,., Exploration~  |     |                  | Execution                   |     | Feedback         | _   |                                 |     |
| ----------------- | --- | ---------------- | --------------------------- | --- | ---------------- | --- | ------------------------------- | --- |
|                   |     | Generation       | •j  "·"                     |     |                  | -   | Gemini 2.0, Stream lit, Pandas  |     |
| UI Crnwlcr &      |     | • Baseline Test  |                             |     |                  |     |                                 |     |
| Graph             |     | Generation       | Execution Engine  RL Agent  |     | Reporting & Fix  |     |                                 |     |
Suoervisor Name:
| Representation  |     | -Al Refinement  | -Test Execution  |     | Suggestions  |     |     |     |
| --------------- | --- | --------------- | ---------------- | --- | ------------ | --- | --- | --- |
| _,,_~~-         |     | '-(LLM)         | & Bu2 Detection  |     |              |     |     |     |
Mr. lrfanullah
Group Members:
| Python  | Playwright  |     | Network)(  Goo,le Gemini  | Streamllt  | JavaScript  |     |     |     |
| ------- | ----------- | --- | ------------------------- | ---------- | ----------- | --- | --- | --- |
Awaiz Ali Khan (221-2509)
| Core langu.ig(l              | Browser     |     | Graph  Al~mantic        | UI/Dashb0ard      |     | Oyn.irnic  |     |                        |
| ---------------------------- | ----------- | --- | ----------------------- | ----------------- | --- | ---------- | --- | ---------------------- |
|                              | Autom~tion  |     | Construction  Ana1ys1s  |                   |     | Scnptmg    |     |                        |
| Group Members:               |             |     |                         | Supervisor:       |     |            |     | Kamran Ali (221-2589)  |
| • Awaiz Ali Khan (221-2509)  |             |     |                         | • Mr. lrfanullah  |     |            |     |                        |
• Kamran Ali {221-2589)

FAST NUCES ISLAMABAD CAMPUS

Codio - An Interactive E-Learning Web App
Codio is a fully implemented Al-assisted interactive e-learning web application that bridges the gap
between passive YouTube-based video tutorials and active hands-on Python programming practice. The
platform allows learners to import any You Tube playlist, watch coding tutorials in a split-screen interface,
and - upon pausing a video - automatically extract visible code from the screen using Google Gemini 2.5
Flash (Vision-Language Model), inject it into an embedded Monaco code editor, and execute it instantly
inside a Judge0-powered sand boxed environment. The system is deployed using Docker and built on a
microservices architecture with a React+ Typescript frontend, Flask REST backend, MongoDB Atlas
database, and Redis caching layer.
Features include:
• Pause-to-Code: Automatic code extraction from paused video frames via Google Gemini 2.5 Flash VLM
- no manual transcription required.
• Integrated Monaco Editor with syntax highlighting, bracket matching, code version history, and PEP8
compliance scoring.
• Sandboxed Python code execution via Judge0 API with real-time stdout, stderr, and runtime error
feedback.
• Al-powered context-aware code auto-completion (Gemini API, temperature 0.2, < 1 s latency).
• Adaptive multi-agent quiz generation (MCQ, True/False, Fill-in-the-blank) from video transcripts with
dynamic difficulty adjustment.
• Transcript-based keyword search allowing learners to jump directly to relevant video timestamps.
• Intelligent debugging assistant providing targeted fix suggestions and explanations for compilation and
runtime errors.
• Personalized dashboard with progress charts, quiz scores, learning streaks, heatmaps, and a
recommendation engine.
• Role-based access control (Student & Adm in) with full immutable audit logging and ad min console.
ARCHITECTUR
CODIO - SYSTEM ARCHITECTURE
'"' -wmtt--:
'
·= y ~ - · - - ~SEIIYICl~ W-- J
-==-~~I
I 11 ...:. .~ 11 ~::::~. I'~
Technology Used:
React+ Typescript, Python Flask, MongoDB
UMt-,..nuw&.-~ .. ~O-oit.,.iw:.V-.U...1,.1....-:(,l;iatN,_-,-.~. _"'_-_.._. ~ ~-o..... .... ....
-. .......- 0.... .. txd
Atlas, Redis, Docker, Google Gemini API (2.5
Flash), YouTube Data API v3, Judge0 API,
TIMELINE OpenCV, yt-dlp, Monaco Editor
FYP-1 (Oct 2025 ): Requirements, architecture design, Supervisor Name:
module planning, use-case specification.
FYP-11 (Feb 2026): Full implementation, integration of Sir lrfan Ullah Shah
1--------------------;
all 7 modules, testing, deployment & demonstration. Group Members:
TOOLS Muhammad Usman (221-2694)
React, Typescript, Flask, MongoDB Atlas, Redis, ,___ _________________- --.
Docker, YouTube Data API v3, Google Gemini 2.5 Muhammad Saleh (221-2583)
Flash, Judge0 API, OpenCV, yt-dlp, Monaco Editor Moawiz Bin Ammar ( 1-2706)
22
FAST NUCES ISLAMABAD CAMPUS

Prismora Al
Prismora  Al  is  a mobile application that transforms long-form  English YouTube  podcasts  into
engaging, bite-sized highlight reels. Users simply upload a podcast URL, and the platform's Al engine
automatically extracts the media to generate highly accurate transcripts and concise summaries.
Utilizing a custom algorithm that analyzes transcript text, audio, and video keyframes, the system
intelligently curates the best moments into adjustable highlight clips of 1, 3, or 5 minutes. These
generated clips are then uploaded to a personalized, community-driven social feed where users can
interact  through  likes,  comments,  profiles,  and  notifications.
Features include:
•  URL-based processing for extracting long-form English podcasts directly from YouTube.
•  Automated transcript generation and text summarization using advanced Al models.
•  Intelligent highlight generation fusing audio, video, and text analysis to output adjustable clips.
•  Community curation feed allowing users to view, like, comment on, and share highlight reels.
•  Comprehensive user profiles, personalized feeds, and real-time engagement notifications.
Key Words: Artificial Intelligence, Mobile Application, Natural Language Processing, Computer Vision,
Podcast Summarization .
•
Prism.ora AI
Motivation
• &.lw.,tiv1W pV1.l\<1.1-l'I' <11'1' kme: ,,n,J tW\<t-<.VJII-WlWlS.
• lJ<;\'n; i,,tmmtk' to lin,J ,;pl:irilk l,;:.,rni1tg point>. in,,i,kl'l""'"lll•~
• No ~ "-~lOO pl,1tfnrm foria.runurOO cdu,.otlo11,1I 1lnd(-.,,;t lnslp;hl$
• Exalh'A K1<.:ial. mcdi.l. prwllole, (.'lllert.Unnwnt Gver mear1i.n~ful 11.'~l'\Ul~.
Solution
• ( unv,·11h ltm(; ,-.lu,',,t,.)n,11 JJi•l•~..,t,., itoh, <,hurt, h'>t.•u.,.,d lt•,1nllrl~ n,,1.,
• l'rm,I~  Al•S<'nt-ml......:l •umn-..:ark'-~ fc,rqukk: undi'r~l.1ndlns
• O(f,en,.1,e.-n;h..,.l,k-ln.ru,.;ripl,. for C.:L'i)' infunu;iolion n:Lri,~val.
| • Al11omatically e):tra("t-.key hi)Qtli~ |                                         | lti and. im.lJ4tbl.          |                                        |     |     |     |
| ---------------------------------------- | --------------------------------------- | ---------------------------- | -------------------------------------- | --- | --- | --- |
| ••  °...,",.,l.oiv;' l 'n- ~ tc          | u; ;tw \ '< .I ,  - . f o ,t t " ,•o:.: | til .• •H : ' ° "   " - ' \1 | .~1 11 t i v < W   (, ..._ >:n.to:>nt  |     |     |     |
| U rn ,•                                  |  w h ilr   p n : ,. . . -, n , m        | g  v ., lu , 1 b l , 1   k   | •• ~ ,. ., 1 .-. -,. JS '' ·           |     |     |     |
Wo.rk:flow
|     |     |     |     | ~-,----~!---- |     | Technology Used:  |
| --- | --- | --- | --- | ------------- | --- | ----------------- |
-
~ - : . ; . _ : - -,
..., ,,.. . ·-- . - , · - - - - - - . ..  e- - - -·  React Native, FastAPI, PostgreSQL, Nest JS,
|     |     |     | .   .  .. , , .: , . . . ,.: .- ;_   _   | ·- - -      |     |     |
| --- | --- | --- | ---------------------------------------- | ----------- | --- | --- |
|     |     |     |                                          | .  ; ] " .  |     |     |
OpenAI Whisper API, Hugging Face
| ...__...._:_.;..;..;.._ |     | _   |     | ____.:,___,.!,  •  .  •  |     |     |
| ----------------------- | --- | --- | --- | ------------------------ | --- | --- |
Transformers, OpenCV, FFmpeg, Visual Studio
Systen1 A1:chiledure
Supervisor Name:
,":1,,uJ1i\,~w~"
!'J.,..J.,. ., y)  I
Mr. Junaid Ali Khan
|     | 1-1  |     | 1-  | I   |     |     |
| --- | ---- | --- | --- | --- | --- | --- |
I
| @   |     | <$  |     | o   |     | Group Members:  |
| --- | --- | --- | --- | --- | --- | --------------- |
1t1w11nc~"
Muhammad Ahtisham (i22 -2690)
|     |     | I "'~:,., .------.--- |      | Alf:,~ ..,(J"-1,,rl)  1'-r-,c-----,  |                          |     |
| --- | --- | --------------------- | ---- | ------------------------------------ | ------------------------ | --- |
|     |     | t;;                   | :!.  | ~-~···- ~::..::-                     | Usman Ghani (i22 -8796)  |     |
IJ~.,....,,..
|     |     | (l•••,..t""'-<''~  | tr ...l Krh  | ~wi.H  |     |     |
| --- | --- | ------------------ | ------------ | ------ | --- | --- |
Abdullah Tariq (i22 -2627)
Tools Used:
|     |     |     | S i. ( ' " l  | ' i ,, ,,. , l t ,y •   |     |     |
| --- | --- | --- | ------------- | ----------------------- | --- | --- |
| @   |     | 0   | M r .  f im 1 | 1 1 M   A . N J .I _.   |     |     |
<$
| --,~·- |     |     | G"~PM"'"t,m;      |                                                  |     |     |
| ------ | --- | --- | ----------------- | ------------------------------------------------ | --- | --- |
|        |     |     | M. i J , ; ,j ,m  | r1 1 n l . < \ / rf r w i . m 1 ( 2 21 lc,SllQ)  |     |     |
|        |     |     | H , , . , . , . ~ | / r .z , ,/   ( ~ 2 1 -. o t 7'l i, )            |     |     |
Ab<Mll.1/, Tw,'ii (lll 2627J
| "~  | ~ .....,  | . FFmpev  |     |     |     |     |
| --- | --------- | --------- | --- | --- | --- | --- |

FAST NUCES ISLAMABAD CAMPUS

2 Synced: Al-Powered B2B Marketing Automation Platform
An Al-driven B2B marketing intelligence platform designed to bridge the gap between sales and
marketing operations in small and medium enterprises. The system integrates fragmented
marketing and sales data into a unified analytics layer that transforms raw engagement data into
actionable insights. Using techniques such as lead scoring, intent prediction, conversation
analytics, funnel monitoring, and revenue attribution, the platform provides a clearer
understanding of customer behavior and pipeline performance. This enables organizations to
make data-driven decisions, improve marketing efficiency, and better evaluate the revenue impact
of their campaigns. Key features include:
• Automated lead ingestion and Al-based lead scoring
• Intent prediction for identifying high-potential prospects
• Conversation intelligence for customer interaction analysis
• Funnel monitoring for detecting pipeline leakage
• Campaign analytics and revenue attribution
• Interactive dashboards and automated insights
Key Words: Artificial Intelligence, Lead Scoring, Predictive Analytics, Marketing Attribution, Revenue
Intelligence
Technology Used:
React, Typescript, Node.js, Express.js,
MongoDB, Python, Scikit-learn, Pandas, NumPy
Su ervisor Name:
Dr. lsma ul Hassan
Grou Members:
Hania Bashir (221-2506)
Esha Riaz (221-2584)
Maadeha Asif (221-2457)
FAST NUCES ISLAMABAD CAMPUS

PROJ.AI
Developed for the Federal Ministry of Planning, Development and Special Initiatives, PROJ.AI is an Al
powered project management, monitoring, and governance system designed to enhance
transparency, operational efficiency, and intelligent decision-making in large-scale national and
organizational projects. The platform leverages advanced technologies such as Natural Language
Processing (NLP), multi-agent Al architectures, predictive analytics, and document intelligence to
transform traditional project tracking into a proactive, data-driven management ecosystem. B
integrating intelligent analysis, automated monitoring, and real-time insights, PROJ.AI enables
stakeholders to manage complex projects more effectively while ensuring accountability, compliance,
and informed strategic planning.
The system provides real-time monitoring of project milestones, budgets, risks, compliance status,
and team performance. Unlike conventional project management tools that act as static trackers,
PROJ.AI actively analyzes performance data, forecasts potential delays and budget overruns, detects
financial anomalies, and generates Al-driven recommendations for corrective action.
It includes modules for financial auditing, compliance monitoring, resource optimization, risk
forecasting, knowledge graph construction, and document summarization in both English and Urdu.
An Al-powered assistant (text and voice-enabled) allows natural language interaction for non
technical stakeholders, making complex project insights easily accessible. A communication
intelligence hub further enhances collaboration by extracting action items from discussions, detecting
conflicts, monitoring sentiment, and converting conversations into structured outcomes.
By combining monitoring, auditing, forecasting, collaboration intelligence, and Al-guided decision
support into a unified platform, PROJ.AI aims to deliver an accountable, transparent, and adaptive
project management solution suitable for large organizations and government institutions.
Key Words: Artificial Intelligence, NLP, Project Management, Predictive Analytics, Governance
Technology Used:
HTMLS, CSS3, JavaScript
Flask/ FastAPI (Python Backend)
PostgreSQL
Chroma Vector Database
TensorFlow / PyTorch
Flutter (Mobile App Development)
Docker & GitHub
Supervisor Name:
Dr. Atif Jillani and Ma'am Anum Kaleem
Group Members:
Hassan Mohiuddin (221-2454)
Awai mer Zaeem (221-2616)
Sarmad Hassan (221-8792)
FAST NUCES ISLAMABAD CAMPUS

LawMate - Al-Powered Virtual Criminal Lawyer
LawMate is an Al-powered virtual criminal lawyer web platform designed to make legal assistance
accessible and affordable for citizens and legal professionals in Pakistan. The system uses Natural
Language Processing (NLP), Retrieval-Augmented Generation (RAG), and a two-stage LLM pipeline built
on a fine-tuned Tinyllama model with a LLaMA-3.3-70B cloud formatter to provide Pakistan-specific
criminal law guidance.
The platform includes three panels: a public user panel with a 24/7 Al chatbot for FIR guidance, b.::iil
information, and rights awareness; a lawyer panel providing case analytics and risk assessment; and an
admin panel for monitoring Al responses and managing the system.
Users can upload legal documents such as Fl Rs, charge sheets, and judgments in English and Urdu,
generate legal templates for courts and police stations, and retrieve legal information from a knowledge
base containing Sindh High Court cases, the Pakistan Penal Code, CrPC, and constitutional laws. The
system also includes a legal accuracy validator and safety guard to ensure reliable responses.
Key features:
• 24/7 bilingual Al chatbot for criminal law queries such as Fl Rs, bail, remand, appeals, and rights
• automated legal document generation for courts and police stations
• Al-based document summarization for long legal files
• case outcome prediction and risk scoring
• lawyer recommendation based on specialization and location
• secure document storage and case tracking
• admin dashboard for monitoring Al responses and system activity
l(ey words: Al, NLP, RAG, Pakistani Criminal Law, LLM Fine-Tuning, Legal Automation, Case Prediction
Technology Used:
L React.js, Redux Toolkit, Node.js, Python,
V
FastAPI, MongoDB, LangChain, RAG
To provide legal assistance using Al in Pipeline, Hugging Face, Tinyllama, LLaMA-
a conversa-tion~al manner t o users.
3.3-70B
I w.,-. •.~1,-ely ,;,ccu,od ,,.. ,11 ti-.•h =~u
Wh.Jt h.•gal !,(~ps "Shouki I tak
under Pa.0:1~1,3,i, I.aw" ~·~-, Supervisor Name:
y---...... I
. =--~:::·
Dr. Zeshan Khan
What ..,..-; ~thet«\11"'1
•h«-«dl ~af).'l.'I:U;'-M~tld:y=~
,_,___,_._. . . ._.t n~r - LLM Reason
•... • •~~M ~~::,.
alnodcehmplata
)'OU-~ prGQeff_. ,.
Group Members:
Zunnoon Waheed (i22 - 2418)
Zubair Ali (i22 -2591)
Muhammad Bilal (i22 - 1533)
• • Mualnt Fooo Q F•stAPI python TEAM MEMBERS
• 12.2-2591 Zubelr All
,'9 LangChaln 0 RAG Pipeline &> React • 122-2418 Zunnoon Waheed
<ffi, Redu• Toolkit nodeJs • Monac,DB • 122-1533 Muhammad 8llal
Supen,lsor.
Dr. Zeshan Khan
C:O..Sup,ff'Vlsor;
Or: Ahmed Raza Shahid
FAST NUCES ISLAMABAD CAMPUS

Prompt Economy
Prompt Economy is a decentralized Al prompt marketplace being developed to provide creators with
verifiable ownership, fair compensation, and secure distribution of their high-quality prompts. There are
two primary views of this platform - Creator View and Consumer View. The former allows prompt
engineers to upload their prompt content, which is securely stored off-chain via IPFS, while simultaneously
tokenizing it into a unique digital asset on the Ethereum blockchain. This establishes provable authorship
and allows the creator to set monetization parameters. The latter is for consumers to safely browse, verify,
and purchase these tokenized prompts seamlessly using Web3 wallet integration (MetaMask). If a
transaction occurs, the system utilizes automated smart contracts to instantly and transparently distribute
royalties to the original creator without the need for a centralized middleman. Furthermore, the platform
incorporates a community governance model, allowing users to stake tokens, build reputation, and
influence platform decisions.
Features include:
• Verifiable prompt ownership and authorship through NFT tokenization on the Ethereum blockchain.
• Secure, hybrid data storage utilizing IPFS for off-chain prompt content and blockchain for
immutable transaction records.
• Automated, transparent royalty distribution to creators via programmable smart contracts.
• Passwordless user authentication and secure transaction signing via Web3 wallet integration
(MetaMask).
• Community-driven governance allowing users to stake tokens, build reputation, and vote on
marketplace parameters.
Key Words: Blockchain, Smart Contracts, Web3, IPFS, Al Prompts
,
,.... ....
t le ~ -. .. ,i PnomPTEconomv ,\I_• H, s W w ..l.p l'.ln c. l n ,,. - • - tt , : ~
R OECERTRRllZEO ffiRRKETPlRCE ,,,... l:ll~H~
..., 1" '11-111,
~1.,,n,atu131" 211-n,r
PROJECT OVERVIEW
BACKGROUND Technology Used:
T,llditioni:il intellectu?il property models fail to ~pture the
Villue ot Al prompt;. React, Web3, MongoDB, Node, Express,
GOAL
Visual Studio
Define verfflable authorship and secure proTipt engineering
.l>Scts on----chai n.
Supervisor Name:
SOLUTION
A hybrid Wt:ib3 pl;-tttorm tokenizing prompts ~s NFTs and
using IPFS for storae;t!. Ms. Hina Bint-e-Haq
MOTIVATION TECHNOLOGY STACK Group Members:
E
S
n
e
c
c
r
u
y
r
p
i
t
t
s
y
d
/I
a
P
t a
P
¢
ro
ff
t
.c
e
h
c
a
ti
in
o
,
n ...'.. ..
Huzaifa Zeeshan (i21- 1134)
• maln1alnlng lmm~table Clodcchain Front•nd
on-chain recorc:.. @~k!ley, ~act~,,
Mtlrtf-1.:WJ Ethus..j,
Proofol Ownership ro1mdry Muhammad Amaar (i21- 2445)
Tokenizes pronl)ts .:is
• t,FTstDest~blishabsotute
dli;ltalautt'lol'SN"P.
fj FalrMorn:tl~ll<Hl ,,_.,~~~~.u,n Sibghatullah (i21 - 1197)
Automal4M ro';'llllty 1-t.•illHon
ptiyout:s to (retitors vl.1
imart contract logic.. J
~-----~ ~-----~
SYSTEM ARCHITECTURE
FVTVREENHANCEMENTS
• DAO Governani::@
• Layer-2 5callng
• i\d~anced Privacy (ZK-prooful
• 4.1Q uality Control
FAST NUCES ISLAMABAD CAMPUS

PrepifyAI
PrepifyAI is an Al-powered preparation assistant designed to help Pakistani students excel in
Matric, FSc (FBISE), and competitive entrance exams like MDCAT and ECAT. The system features
two primary interfaces: a Client Mobile App for students and an Admin Panel for educators.
Students can generate syllabus-aligned practice questions (MCQs, short, and long questions), view
high-probability topic predictions based on past paper trends, and utilize Al that adapts to
students' strengths and weaknesses via tests for personalized learning. The application also
includes gamification elements like streaks and leaderboards to maintain student engagement. If a
student encounters conceptual difficulties, they can receive instant feedback or use the Al-driven
assistant for guidance. The Admin module allows educators to manage official textbooks for Al
ingestion, validate Al-generated content, and monitor overall system health and prediction
accuracy.
Features include:
- Al Question Generation: Automatically generates syllabus-compliant MCQs, short, and long
questions grounded in official textbooks.
- Predictive Analytics: Analyzes past paper trends to predict high-probability topics and frequently
recurring exam questions.
- Adaptive Learning: Assesses student performance via tests and feedback loops for individual
student strengths and weaknesses
- Performance Dashboards: Provides detailed analytics, topic-wise mastery visualization, and
progress tracking over time.
- Offline-First Functionality: Supports seamless learning in low-connectivity areas with background
synchronization.
Key Words: Generative Al, Retrieval-Augmented Generation (RAG), Adaptive Leaming, EdTech, Predictive
Modeling
Technology Used:
React Native, FastAPI, PostgreSQL, Pinecone,
AWS, Tesseract OCR, Sentence Transformers.
Su ervisor Name:
Ms. Anum Kaleem
Group Members:
Ameer Hamza (i22 - 2579)
Saif Ur Rehman (i22 -8767)
Fizza Sarfraz (i22 -0546)
FAST NUCES ISLAMABAD CAMPUS

Trade360
Trade 360 is a cryptocurrency trading platform developed keeping the perspective of traders and
investors in mind. The application enables users to monitor real-time market data from Binance
exchange, analyze technical indicators, and execute automated trading strategies without manual
intervention. The platform leverages machine learning models to predict market price movements
and identify patterns, allowing traders to make data-driven decisions. Users can build and backtest
their own strategies, assess risk and track portfolio performance all within a single unified
dashboard.
Features include:
1. Real-time market data including live price feeds, candlestick charts and order book monitoring
2. Technical indicators including RSI, MACO, Bollinger Bands, EMA and SMA
3. Visual strategy builder with backtesting support
4. ML-based price prediction and market sentiment analysis
5. Portfolio analytics including performance tracking, P&L reporting and risk assessment
Keywords: Algorithmic Trading, Machine Learning, Real-Time Data Streaming, Technical Analysis,
Sentiment Analysis
Technology Used:
Next.js, Python, PostgreSQL, Node.js,
TensorFlow, Github, TradingView
Supervisor Name:
Dr. Behjat Zuhaira
Group Members:
Abdul Moeiz (i22 -2701}
Muhammad Rayan Dar (i22 - 2532}
Abdul Hanan (i22 - 1515}
FAST NUCES ISLAMABAD CAMPUS

MarketMind Al
MarketMind Al is an Al-powered digital marketing automation platform designed for Small and
Medium-Sized Businesses (SMBs). The platform provides a unified solution to automate the entire
digital marketing workflow, reducing manual effort and improving campaign performance. The
system consists of five intelligent modules. Smart Onboarding automatically scans business
websites and social media profiles to extract structured data, classify industries, and build Al-
powered audience segments while integrating advertising accounts. TrendSense Forecasting
gathers external signals such as search trends and social media data to perform sentiment
analysis, demand prediction, and opportunity scoring. Creative Genome uses Generative Al to
produce multi-style ad copies, apply semantic tagging, and ensure brand consistency. Smart
Experiment Manager applies reinforcement learning and multi-arm bandit algorithms to optimize
budget allocation and campaign performance. Autopilot Campaign Manager synchronizes
campaigns across platforms like Meta Ads and Google Ads, enabling predictive budget pacing and
automated optimization. The system aims to reduce time-to-market, minimize ad spend wastage,
and provide enterprise-level marketing automation to SMBs.
Features include:
• Automatic website and social media data extraction
• Al-based industry classification and audience segmentation
• Multi-source trend forecasting and sentiment analysis
• Generative Al ad copy creation with brand consistency checks
• Reinforcement learning-based budget optimization
Key Words: Generative Al, Digital Marketing Automation, Reinforcement Learning, Trend Forecasting.
Technology Used:
Python, FastAPI, React.js, OpenAI API, Facebook
Prophet, OpenCV, MySQL, Docker, Meta Marketing
API, Google Ads API
Supervisor Name:
Ms. Zoya Sumbul Zaheer
Group Members:
Kashan Karim (22i-8754)
Safdar Jan (22i-8804)
Rayyan Ahmed (22i-2489)
FAST NUCES ISLAMABAD CAMPUS

Specora
Specora is an Al-augmented requirements engineering platform designed to support the complete
requirements lifecycle, from elicitation to specification, for software engineering teams. The
platform provides a collaborative workspace where engineers can create projects, gather
requirements through multiple elicitation methods including surveys, meetings, and real-time
chat, and then analyze, clarify, verify, and formally specify those requirements with the assistance
of generative Al.
Features include:
• Multi-method requirements elicitation via surveys, video meetings (LiveKit), and real-time
group chat (Socket.io).
• Al-powered individual and batch requirement analysis for quality attributes such as
completeness, consistency, and ambiguity.
• Technical and legal feasibility assessment using a RAG pipeline (FAISS vector search over
ingested PDF documents).
• Interactive wireframing and diagramming (Excalidraw) for requirement clarification and
prototyping.
• Collaborative rich-text document editor (TipTap) for writing formal SRS and Use Case
specifications.
• Al-assisted chatbot (SpecBot) for generating, refining, and answering queries about
requirements.
• Analytics dashboard with visual charts for tracking requirement quality and project
progress.
Key Words: Generative Al, Retrieval-Augmented Generation (RAG), Requirements Engineering,
Natural Language Processin
SPECORA
Al-Assisted Requirements Engineering
Specora helps engineers elicit requirements by
multiple techniques, analyze their feasibility, clarify
them via wireframing, then verify and specify them
with the help of Al.
Process Flow
Technology Used:
Elicitation Feasibility
JS, Python, Next.js, Express.js, FastAPI, Pinecone,
PostgreSQL, Git, Docker, Antigravity, VO
Supervisor Name:
Wireframing Verification Mr. Junaid Ali Khan
Group Members:
Abdur Rehman (i22 - 2518)
Ayesha Naveed (i22 - 2652)
Specification Aequirements
Bilal Raza (i22 - 2559)
FAST NUCES ISLAMABAD CAMPUS

Memora: Al-Powered Healthcare Augmentation
Memora is an Al-driven system bridging documentation and communication gaps in healthcare
through three specialized interfaces. The Doctor View serves as an assistive "memory layer" for
transcription, consultation summary, and history preloading, while the Patient View tracks
longitudinal health journeys with simplified medical insights, providing instant guidance and
automated explanations to improve treatment adherence. The Admin View ensures system
integrity via data validation, analytics, and failure resolution. Memora eliminates documentation
bottlenecks and fosters a more proactive relationship between providers and patients.
Features include:
- Secure face detection for instant patient identification and immediate medical history retrieval.
-Consultation transcription and structured summary generation.
- Real-time cue detection along with sentiment analysis from speech and facial expressions.
- Live reminders, drug interaction alerts, and Al-assisted diagnostic hints.
- Handwritten prescription recognition along with an Al chatbot for medical queries.
- Longitudinal health journey tracking to visualize patient progress and treatment outcomes.
Key Words: Memory Augmentation, NLP, Computer Vision, Health Informatics, Clinical Support.
• Consultation Summary Cards
• Emot1on;1I lnc;19htc;.
• Real-Time Ctimcal Cues
• Prescnption Suggestions
• Automated Clinical History
Technology Used:
Python (FastAPI), React, Tailwind, OpenCV,
PyTorch, Supabase
Su ervisor Name:
Mr. Junaid Ali Khan
• Consultation Records Group Members:
• Prescnption lnterpretaoon v,a OCR
Muhammad Hassaan Mansur (i22 - 2421)
• Health Journey Tracking
• Lifestyle Guidance
• Doctor Potient Chat Abdul Moiz Hassan (i22 - 2560)
Syed Muhammad Pasha (i22 - 2635)
FAST NUCES ISLAMABAD CAMPUS

ConstructionSight Al - Real-Time Al Construction Intelligence
ConstructionSight Al is an Al-powered construction intelligence platform designed for project
managers and safety teams to convert routine site footage into real-time operational visibility. By
analyzing CCTV and time-lapse streams, the system delivers actionable safety and productivity
insights including PPE compliance with evidence, zone-level activity monitoring (Active/Idle),
equipment utilization tracking and early risk detection through automated alerts. Insights are
presented through executive dashboards, automated weekly reports and a smart query assistant
for instant information retrieval. A digital-twin overlay further enhances decision-making by
highlighting risk zones directly on 2D and 3D site models.
Key Features:
- Evidence-Based Safety Compliance: PPE violation detection with timestamped snapshots
- Progress & Idle Intelligence: Minute-level Active/Idle zone tracking with delay alerts
- Equipment Utilization Monitoring: Machine detection, duration logging and misuse alerts
- Workforce & Risk Analytics: Zone heatmaps, workforce trends and rule-based risk scoring
- Decision Support & Visualization: Dashboards, automated reports, smart assistant and digital-
twin alert mapping
Key Words: Computer Vision, YOLOv8, Construction Intelligence, Risk Analytics, Digital Twin
CONSTRUCTIONSIGHT Al E)
Technology Used:
Python, YOLOv8, OpenCV, Fast API,
PostgreSQL, React, Celery, n8n
Supervisor Name:
Dr. Uzma Mahar
Group Members:
li:m\l
Haider Ali (i22 - 2655)
ja, 9 VOLO•• 0 FastAPI qi @ fill Celery
......... Farzam Suhail (i22 - 2621)
Muhammad Mujtaba (i22 - 2123)
FAST NUCES ISLAMABAD CAMPUS

Academic Chatbot
Al pen Mesh is an intelligent traffic management platform that uses computer vision and distributed system
architecture to monitor and analyze urban traffic conditions. The system processes live traffic camera
feeds to detect vehicles, identify congestion patterns, and generate real-time traffic insights that support
adaptive monitoring, regulation, and decision making for smarter urban mobility.
The platform consists of Edge Traffic Al Agents that process camera streams and extract traffic metrics, a
central Master Agent that analyzes traffic conditions and coordinates system responses, and a Reporting
Agent that generates alerts and communicates incidents to operators and relevant authorities. A digital
twin simulation environment using SUMO enables safe experimentation and training of traffic strategies
using real-world traffic data. The system is built as a full-stack platform with an operator dashboard and is
designed to scale through distributed compute participation. Future extensions explore decentralized
compute contribution and blockchain-based mechanisms for transparent coordination and resource
participation.
Features include:
• Real-time traffic monitoring using computer vision and live camera feeds
• Detection of vehicles, congestion patterns, and traffic anomalies
• Edge-based traffic data processing and metric extraction
• Central coordination of traffic insights through the Master Agent
• Incident detection and automated reporting to relevant authorities
• Digital twin simulation using SUMO for scenario testing and model improvement
• Interactive operator dashboard for monitoring traffic metrics and system status
Key Words:
Computer Vision, Traffic Management, Digital Twin Simulation, Distributed Systems, Smart Mobility
Technology Used:
YOLO, OpenCV, SUMO, MongoDB, Python,
Node.js, Express.js, Flask, React, Solidity, Git,
Docker, Pytorch
Supervisor Name:
Mr. Laiba lmran
Group Members:
Muhammad Waqas Shahid Khan (i22 - 2469)
Abdullah Mansoor (i22 - 8808)
FAST NUCES ISLAMABAD CAMPUS

Optivus - Al-Powered Virtual Interview Platform
Optivus is an Al-powered virtual interview platform that automates first-round candidate screening.
Recruitment today is slow, inconsistent, and difficult to scale - recruiters repeat the same questions for
hundreds of applicants, subjective evaluation introduces bias, and high applicant volumes make equal
attention impossible. Optivus addresses all three problems by deploying an Al agent that conducts
structured, role-specific interviews, analyses verbal and non-verbal responses, and delivers recruiter-ready
reports. Integrated with Zoom and Google Meet via Recall.ai, the system enables parallel interviews,
eliminates repetitive manual effort, and ensures every candidate is evaluated against the same objective
rubric.
Key features include:
- Automated interviews with dynamic follow-up questions based on candidate responses, driven by OpenAI
language models.
Secure video meeting integration with Zoom and Google Meet via Recall.ai for real-time audio/video
capture.
Real-time transcription and Natural Language Understanding (NLU) for answer relevance and per-skill
scoring.
Behavioral and confidence analysis: gaze, posture, facial cues, tone, and speaking confidence from
audio/video.
Candidate insights report: transcript, strengths/weaknesses, per-skill scores, and role-fit recommendation.
Key Words: Al Interviewing, Natural Language Understanding, Behavioural Analysis, Automated
Screening, Video Conferencing Integration
Technology Used:
Rea ct/TypeScri pt/Node.js/Express, Mo ngoD B,
Python/FastAPI, OpenAI LLM, Recall.ai,
Wav2Vec2, O enCV, Docker
Supervisor Name:
Mr. Junaid Ali Khan
Group Members:
Suleman Ahmadzai (22i-8807)
Abdul Qudoos (22i-8774)
M. Husnain Ashfaq (22i-2536)
FAST NUCES ISLAMABAD CAMPUS

VAEShade - Al-Resistant Audio & Video Protection System
VAEShade is an Al-resistant protection system designed to safeguard audio and video content from
unauthorized Al exploitation. The system addresses the growing threat of Al-powered speech
transcription (OpenAI Whisper), voice cloning (Elevenlabs, Respeecher), and deepfake video
generation (DeepFacelab, FaceSwap, Wav2Lip). Unlike existing noise-based protections that are
easily stripped by Al denoisers (Adobe Podcast, RTX Voice, Krisp), VAEShade embeds adversarial
perturbations WITHIN the audio and video signals themselves. These perturbations are treated as
part of the original content by denoisers, making them resistant to removal while effectively
confusing Al models. The protected content remains natural and clear to human listeners and
viewers.
Features include:
• Audio Protection (7 Techniques): Time-domain perturbations, pitch/prosody manipulation,
psychoacoustic masking, harmonic manipulation, gradient-based adversarial perturbations
targeting Whisper model, spectral envelope modification, and formant perturbation.
• Video Protection (5 Techniques): Frame-level adversarial perturbations, face detection with
region-specific targeted protection, temporal consistency across frames, motion-aware
perturbation tracking, and anti-recognition layer targeting deepfake and facial recognition
models.
• Web-based interface with drag-and-drop upload, configurable protection strength {0-100%),
and one-click download. Supports Audio (WAV, MP3, FLAC, AAC, M4A) and Video (MP4, AVI,
MOV, MKV).
Key Words: Adversarial Machine Learning, Audio Protection, Deepfake Prevention, Psychoacoustic
Masking, Al-Resistant Media
Technology Used:
Python, Flask, PyTorch, Torchaudio,
Hugging Face Transformers, Whisper,
OpenCV, NumPy, SoundFile, LibROSA
Supervisor Name:
Ms. Anum Kaleem
Group Members:
Arbaz Masood {22i-2406)
Sanaan Azfar (22i-2594)
FAST NUCES ISLAMABAD CAMPUS

Al-Powered CRM System with Ensemble Agents
An Al-Powered CRM system with ensemble agents is developed, keeping the perspective of sales teams, customer service
representatives, marketing professionals, and system administrators. There are three views in the application Agent View, Manager
View, and Super Ad min View, each tailored to the specific needs of its user class. The system implements a multi-agent architecture
consisting of four specialized Al agents: an Orchestrator Agent that classifies user intent using Natural Language Processing and
intelligently routes tasks, a Sales Agent for lead qualification and revenue automation, a Service Agent for customer support and
knowledge base operations, and a Marketing Agent for content generation and campaign management. The platform supports both
text-based and voice-based interaction through an integrated voice assistant with speech-to-text (Groq Whisper) and text-to-speech
(Piper) capabilities, enabling natural language CRM operations in English. The frontend is a role-based CRM dashboard built with
React providing real-time pipeline management, analytics, and Al-powered insights. All agent operations are automatically
synchronized to a Supabase (PostgreSQL) database with full CRM schema alignment.
Features include:
• Intent classification and intelligent task routing via the Orchestrator Agent using NLP and LLM-based analysis (Groq Llama
3.3 70B).
• Sales Agent with BANT-based lead qualification (Budget, Authority, Need, Timeline) and multi-factor lead scoring (0-100
scale, graded A through F).
• Automatic CRM synchronization for leads, calls, follow-ups, meetings, and client records.
• Voice call tracking with duration calculation, transcript storage, and outcome determination.
• Service Agent with ticket management, RoBERTa-based auto-classification across five categories, and priority assignment.
• Al-powered Knowledge Base with RAG (Retrieval-Augmented Generation) and semantic search using vector embeddings
(all-MiniLM-L12-v2, cosine similarity). Auto-resolves tickets when confidence exceeds 85%; escalates to human agents
otherwise.
• Email-to-ticket ingestion and intelligent agent queue management.
• Marketing Agent with Al Content Studio for generating emails, SMS messages, call scripts, ad copy, and social media posts
using local LLMs (Ollama).
• Al-powered campaign management, email sequence generation (3-7 step nurturing), and social media scheduling with
platform-specific optimization.
• Lead temperature analysis (hot/warm/cold), automated nurturing engine, and A/B testing.
• Voice assistant with multi-provider STT/TTS, Voice Activity Detection (VAD), interruption handling, and multi-turn
conversations.
• Role-based CRM dashboard with Sales Hub, Marketing Hub, Support Hub, and Admin panel.
Key Words: Al-Powered CRM, Multi-Agent System, Natural Language Processing, Lead Qualification, Retrieval-Augmented Generation
TIMELINE: FYP-I (Oct 2025): Requirements, architecture design, module planning, use-case specification.
FYP-II (Feb 2026): Full implementation, integration of all modules, testing, deployment & demonstration.
Architecture Technology Used:
React 18, Typescript, Python, FastAPI,
I~,,.~. I LangChain, Supabase (PostgreSQL + pgvector),
Groq (Llama 3.3 70B), Ollama (Llama 3.1),
I ·-~,,---,
SentenceTransformers, RoBERTa, Groq
Whisper, Piper TTS
Supervisor Name:
Dr Asif Muhammad Malik
Group Members:
Abdul Faheem (22i-2629)
Husnain Akram (22i-2464)
Sheryar Ali (22i-2623)
Session: 2022 - 2026
Supervisor Signature: ________
Date:
FAST NUCES ISLAMABAD CAMPUS

Academic Chatbot
Architext is an Al-powered architectural design system that automatically generates complete 30
house models from simple user inputs such as area, room requirements, and number of floors.
Traditional architectural workflows require significant manual effort and expertise to design layouts,
validate structural feasibility, and estimate construction materials. Architext simplifies this process
by using generative Al to produce structurally aware house models that can be directly integrated
into professional architectural software. The system also provides structural feasibility checks and
material cost estimation, enabling faster design prototyping and more accessible architectural
planning for both professionals and non-experts.
Features include:
Generates complete multi-floor house models from user input.
Automatically detects unsupported spans and places structural supports such as beams and pillars.
Export and integration with professional tools through a plugin interface.
Estimates Cost of the project based on different materials.
Learns from user modifications to improve future model generation.
Supervisor:
Mr. Majid Hussain
Co-Supervisor:
Or. Zeeshan Khan • Generative Al
Group MIRmber~:
umer Abdullah 221-1349
NATIOHAL Ut-llVERSITY Arfeen Dlldar 221-2645 • 3D Model Generation
of Comput.er 6 Emer!jllnv Scl•nc.e5 Jala.l Maider 221-8755
• Building Information Modeling (BIM)
ArchiText: Al-Powered
• Architectural Automation
Text-to-BIM Generator.
• Structural Feasibility Analysis
Fro;,, Description to 3D Desi 'n Jn sec'tnds
-
_... Arc:hltan
Technology Used:
Python, Pytorch, FastAPI,
Tailwind, IFC openshell,
HuggingFace, NextJS, Docker,
Objective
Jenkins, GitHub Actions
Transform natural language descriptions into industry-
standard 3D BIM Model instantly. Supervisor Name:
How it works
Mr. Majid Hussain
Co-Supervisor Name:
Dr. Zeeshan Khan
Group Members:
OIM Model Output
Umer Abdullah (i22 - 1349)
1
NLP Engine Struc;turc Validation r Jalal Sherazi (i22 - 8755)
Technology Stack
- q Arfeen Awan (i22 -2645)
0
-r-
FAST NUCES ISLAMABAD CAMPUS

Market Minds
Market Minds is an Al-powered web-based financial analytics platform designed to support
worldwide global investors in making smarter investment decisions. It integrates real-time stock,
forex, cryptocurrency, and economic data into a unified dashboard. The system applies to advanced
machine learning models such as LSTM, and CNN for price prediction and automated pattern
recognition. It also performs sentiment analysis using financial news and macroeconomic event
modeling (CPI, PPI, NFP, FOMC).
Users can access interactive charts, Al-driven insights, and intelligent BUY/SELL signals. The backend
ensures secure authentication, data processing, and real-time alerts through scalable APls. Built
with React.js, Fast API, and Docker, the platform follows a modular and cloud-ready architecture.
Market Minds delivers an affordable, intelligent, and data-driven solution for modern investment
analysis.
MA
MINDS
MarketMinds is an Al-powered financial dashboard that
integrates real-time market data with advanced machine
learning models to deliver accurate price predictions,
sentiment insights, and automated trading signals
JI
Architecture
«
Market
Minds Technology Used:
Al
Python, Flask, Html, CSS,
Timeline
Deployment MongoDB, Visual Studio Code,
Documentation Model Formation Testing
Machine learning, Deep learning,
Ai Model Training
Supervisor Name:
Preprocessing Proce sing Oynam·c Information
Mr. Sohail Abbas
Tools Team
1222679 Asim Shchzad Group Members:
~ !ask i221992 Bilal Fayyaz
t :.(~
i221902 lnam Ul Haq 1222679 Asim Shehzad
::i~-
Supervisor
i221992 Bilal Fayyaz
Mr. Sohail Abbas
i221902 lnam UI Haq
FAST NUCES ISLAMABAD CAMPUS

Al Deployment Agent
An Al Deployment Agent app is being developed, whilst keeping the perspective of developers and
DevOps professionals. The system automates the entire deployment lifecycle by allowing users to
interact using natural language commands in plain English. The agent handles complex cloud
infrastructure tasks automatically - from generating Cl/CD pipelines, Docker files, and Kubernetes
configurations, to deploying applications across cloud platforms like AWS. In the event of a
deployment failure or anomaly, the system does not require manual intervention; instead, it
leverages a Self-Healing & Reinforcement Learning Engine that detects anomalies, triggers smart
alerts, and performs automatic rollback. Features include:
1. Natural language commands to deploy applications to cloud infrastructure.
2. Auto-generation of Cl/CD pipelines, Docker files, and Kubernetes configs.
3. Multi-cloud orchestration supporting AWS, Azure, and GCP simultaneously.
4. Self-healing system with anomaly detection and automatic rollback.
s. Supports AWS deployment with infrastructure-as-code using Terraform.
Key Words: Cl/CD Automation, Kubernetes, Multi-Cloud Orchestration, Self-Healing Systems,
Natural Language Processing
Al Deployment
Agent
l'ltdt-p,tDc\l()fH,a.ll)t'ftM(lnll"f().-9'1'<1.P ITU! nqen1M•fe1r~m:-Nlcam,1g
c:,
~_,~ C,::+.P"pi,,,,.--.,u
,I. ......
0 AICCMleA>'W)':.lls. .._.,..,._"
~-~+•~-~
I
•M·-•--._ -
11 n"•
-
•• ,.,_ I
0 '.:'1 ~o.:i~~-~,.~.•M-
r,n,
+
0
Technology Used:
Python, Fast API, React, Typescript, Docker,
e •
Aws, Terraform
NatcwalLlni;iua,ge ~utoOICO
;,,. ..l l'...,Lr,;1<• ..
Supervisor Name:
I ~-•-M 11 ,. .. II ,,_,_ I
8 M .. Mr. lrfan Ullah
M.....,.I........C.. to,,,c~l- ~..-1> J$eIl.l,-H,.H_,r, n!,J.I. .,. .,, I~.. ~ , 1~1--II·~·-I~
Group Members:
Abdul Ahad (i22 - 2721)
EJ
Hamza Farooqi (i22 - 2615)
....,,."-,noq1
,.,:,..:... . I.Mo>
FAST NUCES ISLAMABAD CAMPUS

AutoSphere
AutoSphere is a comprehensive web-based automotive platform engineered to transform
Pakistan's automotive sector through cutting-edge technology integration. The platform addresses
the critical problem of information asymmetry, fraudulent vehicle histories, and lack of
standardized pricing in the used-car market - a multi-billion rupee industry with no trusted digital
infrastructure. Built on a microservices architecture using FastAPI, Node.js, React.js, and Next.js,
AutoSphere delivers five deeply integrated modules that span the complete vehicle lifecycle.
Blockchain technology ensures tamper-proof service histories, while Python-based machine
learning models power real-time price valuations. Computer vision via YOLOv8 and ResNet enables
automated damage detection from uploaded images, estimating repair costs instantly. The
platform connects vehicle owners with verified workshops for certified service bookings and runs
transparent e-auctions where Al-validated prices prevent manipulation. Data is persisted across
PostgreSQL, MongoDB, with JWT-based auth, AES-256 encryption, and role-based access control
throughout.
Key Features:
• Blockchain-Backed Vehicle History: Immutable, on-chain service records accessible by buyers,
insurers, and regulators. Only certified workshops can log entries with mileage, parts, images,
and costs.
• Al Price Valuation: ML models trained on Pakistan's live market data analyze make, model, year,
mileage, and condition to generate fair, real-time valuations for buyers and sellers.
• Al Damage Detection: Computer vision (YOLOv8) scans uploaded car images to detect dents,
scratches, broken parts, and paint damage, providing severity ratings and instant repair cost
estimates.
• Certified Service Booking: Only vetted, certified workshops are listed. Users filter by service type,
price, or location and book appointments digitally with upfront cost estimates.
• Vehicle E-Auctions: Transparent bidding marketplace where sellers set minimum bids and
deadlines. Al valuation prevents mispricing; highest bidder at close wins.
• Real-time auction bidding via WebSockets, and admin analytics dashboard for valuation trends
and transaction patterns.
Key Words: Blockchain, Computer Vision, Machine Learning, Microservices, Automotive Fin Tech
Technology Used:
React.js, Next.js, FastAPI, Node.js,
PostgreSQL, MongoDB,
Python, WebSockets
Supervisor Name:
Dr. Asif Muhammad
Group Members:
Muhammad Danish Rafique (22i-2653)
Haseeb Sajid (22i-2510)
Maaz Khalid (22i-2736)
FAST NUCES ISLAMABAD CAMPUS
