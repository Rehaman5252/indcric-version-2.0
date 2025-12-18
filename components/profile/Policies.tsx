"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function Policies() {
  return (
    <div className="w-full space-y-6 max-w-6xl mx-auto px-4 py-8">
      {/* Company Info */}
      <div className="bg-muted/50 p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-4">Halekard Private Limited</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Registered Office:</strong> 15-1-47/2, Panasathota, Narasaraopet, Palnadu, Guntur, Andhra Pradesh – 522601</p>
          <p><strong>CIN:</strong> U86900AP2024PTC114185</p>
          <p><strong>GSTIN:</strong> 37AAHCH2546N1Z5</p>
          <p><strong>Website:</strong> www.indcric.com</p>
          <p><strong>Support Email:</strong> rehamansyed07@gmail.com</p>
          <p><strong>Support Phone:</strong> +91 78427 22245</p>
        </div>
      </div>

      {/* Main Accordion */}
      <Accordion type="single" collapsible className="w-full space-y-4">
        
        {/* QUIZ POLICIES - MAIN SECTION */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <AccordionItem value="quiz-section" className="border-0">
            <AccordionTrigger className="px-6 py-4 hover:bg-blue-500/10 flex items-center gap-3">
              <div className="h-6 w-1 bg-blue-500 rounded-full" />
              <span className="text-xl font-bold text-foreground">Quiz Policies</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-0 bg-muted/30">
              <Accordion type="single" collapsible className="w-full space-y-2">
                
                {/* Quiz Policy 1 */}
                <AccordionItem value="quiz-1" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-blue-500">
                    Platform Mission & Responsible Participation
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <h4>Our Mission</h4>
                    <p>indcric is dedicated to providing a premier knowledge-based cricket trivia platform. Our mission is to celebrate the passion for cricket by offering a fair, transparent, and secure environment for our users to test and enhance their knowledge of the sport.</p>
                    <h4>User Acknowledgment & Responsible Conduct</h4>
                    <p>By participating on this platform, you expressly acknowledge and agree that indcric is designed exclusively for the purpose of testing and improving one's knowledge of cricket. It is not intended for entertainment, financial gain, or as a game of chance or gambling. We expect all users to participate responsibly. Users must be 18 years of age or older.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Quiz Policy 2 */}
                <AccordionItem value="quiz-2" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-blue-500">
                    Fair Play & Anti-Malpractice Policy
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <p>indcric maintains a strict zero-tolerance policy against any form of malpractice to ensure the integrity of our knowledge-based quizzes. Any attempt to undermine the fairness of the platform is a material breach of these terms.</p>
                    <ul>
                      <li><strong>Prohibited Actions:</strong> Malpractice includes, but is not limited to, the use of multiple accounts, bots, automated scripts, screen sharing, minimizing the app or switching tabs during a live quiz, colluding with other players, or exploiting any bugs or loopholes.</li>
                      <li><strong>"No-Ball" System:</strong> We employ automated and manual systems to detect such actions. Activities like switching tabs during a quiz will result in a "No-Ball" warning. Accumulating three (3) "No-Balls" within a 24-hour period will lead to a temporary suspension from gameplay for that day.</li>
                      <li><strong>Consequences of Violation:</strong> Any user found engaging in malpractice, as determined by indcric in its sole discretion, will face penalties including, but not limited to, immediate disqualification from quizzes, forfeiture of all prizes, and permanent suspension of their account.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                {/* Quiz Policy 3 */}
                <AccordionItem value="quiz-3" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-blue-500">
                    Prizes & Payout Policy
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <p>Prizes on indcric are granted as a recognition of a user's superior knowledge, demonstrated by achieving a perfect score in a quiz.</p>
                    <ul>
                      <li><strong>Nature of Prizes:</strong> Prizes are not "winnings" from a wager, but are awards for demonstrating exceptional knowledge.</li>
                      <li><strong>Eligibility:</strong> Users must have a verified account, including a valid UPI ID, and be in full compliance with our terms to be eligible for prizes.</li>
                      <li><strong>Taxation:</strong> All prizes are subject to taxation as per the laws of India, including Tax Deducted at Source (TDS) under Section 194BA of the Income Tax Act, 1961, where applicable. It is the user's responsibility to comply with their personal tax obligations.</li>
                      <li><strong>Verification:</strong> We reserve the right to request additional KYC (Know Your Customer) documentation to verify identity and prevent fraud before processing prizes, in accordance with applicable regulations.</li>
                      <li><strong>Timeline:</strong> Your reward amount will be processed within 72 working hours i.e 1 day is equal to 9 working hours, of the quiz completion, subject to successful verification and compliance with all applicable laws.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                {/* Quiz Policy 4 */}
                <AccordionItem value="quiz-4" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-blue-500">
                    Platform Mechanics Explained
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <h4>Daily Streaks</h4>
                    <p>Users can build a "Daily Streak" by playing at least one quiz every day (based on the UTC calendar). The streak increases by one for each consecutive day of play. Missing a day will reset the streak to zero. Reaching certain streak milestones may unlock badges or other non-monetary acknowledgments on the platform.</p>
                    <h4>Referral Program</h4>
                    <p>Users can invite friends using a unique referral code. A successful referral occurs when a new user signs up with the code and completes their first perfect-score quiz. The referring user will then receive a referral bonus as a prize. The terms and amount of the referral bonus are subject to change.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Quiz Policy 5 */}
                <AccordionItem value="quiz-5" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-blue-500">
                    Commentary Box & User Contributions
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <h4>Content Submission</h4>
                    <p>The "Commentary Box" feature allows users to contribute original cricket-related content, including facts, posts, and quiz questions, to the indcric community.</p>
                    <h4>Verification Process</h4>
                    <p>All user-submitted content is subject to review and verification by our moderation team. Content will not be published on the platform until it has been approved. You can view the status of your submissions (e.g., "Under Verification", "Verified", "Rejected") in your contribution history.</p>
                    <h4>Content Guidelines</h4>
                    <ul>
                      <li><strong>Originality:</strong> All submissions must be your own original work. Plagiarism or submitting content copied from other sources is strictly prohibited.</li>
                      <li><strong>Accuracy:</strong> Facts and quiz questions must be accurate and verifiable.</li>
                      <li><strong>Appropriateness:</strong> Content must not be offensive, abusive, defamatory, or contain any inappropriate material.</li>
                    </ul>
                    <h4>Content Rights & Usage</h4>
                    <p>By submitting content, you grant indcric a perpetual, worldwide, non-exclusive, royalty-free license to use, reproduce, modify, publish, and display the content on our platform and in our marketing materials. You will be credited for your contribution where appropriate.</p>
                    <h4>Contribution Rewards</h4>
                    <p>Users can earn non-monetary rewards, such as Gift Vouchers, by meeting specific contribution quotas. A reward is only unlocked after the required number of submissions for each content type (facts, posts, questions) has been successfully verified and approved by our moderators. indcric reserves the right to change the reward structure and quotas at any time.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        </div>

        {/* LEGAL POLICIES - MAIN SECTION */}
        <div className="bg-card border rounded-lg overflow-hidden">
          <AccordionItem value="legal-section" className="border-0">
            <AccordionTrigger className="px-6 py-4 hover:bg-red-500/10 flex items-center gap-3">
              <div className="h-6 w-1 bg-red-500 rounded-full" />
              <span className="text-xl font-bold text-foreground">Legal & Compliance Policies</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-0 bg-muted/30">
              <Accordion type="single" collapsible className="w-full space-y-2">
                
                {/* Legal 1 */}
                <AccordionItem value="legal-1" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    
                    Introduction
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <p><strong>1.1</strong> This Comprehensive Strict-Legal Policy Suite ("Policy", "Agreement", "Document") governs the access to and use of the digital platform branded as "IndCric" ("Platform"), operated by Halekard Private Limited ("Company", "We", "Us", "Our").</p>
                    <p><strong>1.2</strong> By accessing, browsing, registering on, or otherwise using the Platform, any individual ("User", "You", "Your") expressly agrees to be bound by this Policy and all related terms, conditions, policies, and notices incorporated by reference.</p>
                    <p><strong>1.3</strong> If a User does not agree to any provision of this Policy, such User must immediately cease all use of the Platform.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 2 */}
                <AccordionItem value="legal-2" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                  Legal Basis and Classification
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <p><strong>2.1</strong> The Platform is designed and operated as a free-to-play, skill-based digital quiz service focused on cricket knowledge and related skill attributes.</p>
                    <p><strong>2.2</strong> The Platform does not accept any entry fee, subscription charge, deposit, top-up, wager, or stake from Users. No User-funded prize pool, wallet, or betting mechanism exists.</p>
                    <p><strong>2.3</strong> In the absence of stakes, deposits, or chance-based mechanics, the Platform is not an "online money game", gambling, betting, or wagering platform under Indian law, including but not limited to the Promotion and Regulation of Online Gaming Act, 2025 and applicable state laws.</p>
                    <p><strong>2.4</strong> All monetary Rewards (for example, promotional payouts such as ₹100 per successful quiz) are funded solely from the Company's own resources, including advertising revenue. Users never contribute money to any Reward pool.</p>
                    <p><strong>2.5</strong> The Platform is intended to be permissible across India, including states with restrictions on stake-based or chance-based games, because Users do not risk any money and gameplay is predominantly skill-based.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 3 */}
                <AccordionItem value="legal-3" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    Definitions
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <p><strong>3.1</strong> "Platform" means the IndCric digital service, including the website www.indcric.com, backend systems, APIs, databases, user interfaces, quiz engines, and all associated components.</p>
                    <p><strong>3.2</strong> "Company" means Halekard Private Limited, its directors, officers, employees, agents, contractors, successors, and permitted assigns.</p>
                    <p><strong>3.3</strong> "User" means any natural person who accesses or uses the Platform, who is at least eighteen (18) years of age, is legally competent to contract, and is accessing from within India.</p>
                    <p><strong>3.4</strong> "Reward" or "Payout" means any monetary or non-monetary benefit issued to a User by the Company, funded solely by the Company, subject to eligibility, verification, internal checks, and complete discretion of the Company.</p>
                    <p><strong>3.5</strong> "Personal Data" has the meaning assigned under the Digital Personal Data Protection Act, 2023 ("DPDP Act"), including any data that identifies or is capable of identifying a User.</p>
                    <p><strong>3.6</strong> "KYC" means "Know Your Customer" verification processes that the Company may undertake for identity, anti-fraud, or compliance purposes.</p>
                    <p><strong>3.7</strong> "Fraudulent Behaviour" includes, without limitation: cheating, creating multiple accounts, impersonation, use of bots or scripts, VPN/proxy use to spoof location, attempt to bypass advertisement or payout logic, exploitation of vulnerabilities, and any conduct intended to obtain unfair advantage or cause harm.</p>
                    <p><strong>3.8</strong> "Advertiser" means any brand or entity lawfully operating in India which provides advertisements, sponsorships, or promotional content displayed on the Platform.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 4 */}
                <AccordionItem value="legal-4" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    Terms of Use
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <h4>4.1 Eligibility:</h4>
                    <ul>
                      <li>(a) The Platform is strictly for individuals who are eighteen (18) years of age or older.</li>
                      <li>(b) Users must be Indian residents or citizens and must access the Platform from within India.</li>
                      <li>(c) Users must be legally competent to enter into a binding contract under Indian law.</li>
                    </ul>
                    <h4>4.2 Binding Agreement:</h4>
                    <p>By clicking "Start", "Play", "Register", "Login" or any similar action, or by continuing to use the Platform, the User acknowledges that they have read, understood, and agreed to this Policy.</p>
                    <h4>4.3 User Responsibility:</h4>
                    <p>The User shall:</p>
                    <ul>
                      <li>(a) Provide true, accurate, and complete information during registration and use.</li>
                      <li>(b) Ensure their device, network, and browser are compatible with the Platform.</li>
                      <li>(c) Use the Platform only for lawful purposes and in accordance with this Policy.</li>
                    </ul>
                    <h4>4.4 Platform Availability:</h4>
                    <p>The Platform is provided on an "as-is" and "as-available" basis. The Company may, at its sole discretion:</p>
                    <ul>
                      <li>(a) modify, suspend, or discontinue the Platform or any part thereof;</li>
                      <li>(b) restrict access temporarily or permanently;</li>
                      <li>(c) introduce, modify, or remove features, without any liability to the User.</li>
                    </ul>
                    <h4>4.5 Right to Refuse Service:</h4>
                    <p>The Company reserves the right to refuse, suspend, or terminate access to any User at any time, with or without notice, where the Company suspects a breach of this Policy, unlawful activity, or risk to the Platform or other Users.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 5 */}
                <AccordionItem value="legal-5" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    Account Creation and User Obligations
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <h4>5.1 Account Registration:</h4>
                    <ul>
                      <li>(a) The User may be required to register using a mobile number, email address, or other identifiers.</li>
                      <li>(b) All information provided must be accurate and kept up to date.</li>
                    </ul>
                    <h4>5.2 Single Account:</h4>
                    <p>The User is permitted to maintain only one (1) account on the Platform. Multiple accounts held or controlled by the same individual are strictly prohibited.</p>
                    <h4>5.3 Account Confidentiality:</h4>
                    <p>The User shall:</p>
                    <ul>
                      <li>(a) maintain the confidentiality of their login credentials;</li>
                      <li>(b) be solely responsible for all activities under their account;</li>
                      <li>(c) promptly notify the Company of any suspected unauthorized access.</li>
                    </ul>
                    <h4>5.4 User Warranties:</h4>
                    <p>The User warrants that they shall not:</p>
                    <ul>
                      <li>(a) provide false or misleading information;</li>
                      <li>(b) misrepresent their identity, age, or location;</li>
                      <li>(c) use the Platform in violation of this Policy or applicable law.</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 6 */}
                <AccordionItem value="legal-6" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    Prohibited Conduct
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <h4>6.1 Prohibited Behaviour:</h4>
                    <p>Without limiting any other provisions, the User shall not:</p>
                    <ul>
                      <li>(a) use bots, scripts, automation tools, emulators, or other automated means;</li>
                      <li>(b) use VPNs, proxies, or IP-masking to misrepresent location;</li>
                      <li>(c) reverse engineer, modify, hack, or interfere with the Platform's code, security, or infrastructure;</li>
                      <li>(d) exploit any bug, vulnerability, or glitch;</li>
                      <li>(e) manipulate quiz timers, questions, or scoring;</li>
                      <li>(f) collude with other Users to manipulate outcomes or Rewards;</li>
                      <li>(g) artificially trigger or fake advertisement impressions or video views;</li>
                      <li>(h) provide false KYC or UPI information;</li>
                      <li>(i) publish or transmit defamatory, obscene, hateful, illegal, or otherwise objectionable content.</li>
                    </ul>
                    <h4>6.2 Consequences:</h4>
                    <p>The Company may, at its sole discretion:</p>
                    <ul>
                      <li>(a) immediately terminate the User's account;</li>
                      <li>(b) block IPs and device identifiers;</li>
                      <li>(c) cancel, withhold, or confiscate any pending Rewards;</li>
                      <li>(d) deny re-registration;</li>
                      <li>(e) report the User to law enforcement or regulatory authorities.</li>
                    </ul>
                    <h4>6.3 Monitoring:</h4>
                    <p>The Platform may log and monitor device metadata, IP addresses, user behaviour, quiz logs, and ad interaction data for the purposes of security, fraud detection, and compliance.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 7 */}
                <AccordionItem value="legal-7" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    Reward & Payout Policy
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <h4>7.1 Nature of Rewards:</h4>
                    <p>Rewards issued by the Platform are promotional in nature, discretionary, fully funded by the Company, and not guaranteed entitlements or rights.</p>
                    <h4>7.2 No Entry Fee; No User Deposits:</h4>
                    <ul>
                      <li>(a) Users are never charged to play.</li>
                      <li>(b) The Platform does not accept deposits, bets, stakes, or entry fees from Users.</li>
                      <li>(c) Users do not contribute to any prize pool.</li>
                    </ul>
                    <h4>7.3 Reward Eligibility:</h4>
                    <p>A User may qualify for a Reward only when they meet specific performance requirements, have complied fully with this Policy, and have passed all required verification and fraud checks imposed by the Company.</p>
                    <h4>7.4 Verification Before Payout:</h4>
                    <p>Prior to approving any payout, the Company may require OTP-based verification, confirmation of UPI ID, device and behaviour pattern checks, submission of KYC documents, and any other verification considered necessary.</p>
                    <h4>7.5 Payout Method:</h4>
                    <ul>
                      <li>(a) Payouts are typically made via UPI transfer or other lawful digital methods.</li>
                      <li>(b) The User is responsible for providing an accurate UPI address.</li>
                      <li>(c) The Company is not responsible for loss if the User supplies wrong or invalid payout details.</li>
                    </ul>
                    <h4>7.6 Right to Withhold, Deny, or Cancel Payouts:</h4>
                    <p>The Company may withhold, deny, or cancel any Reward or payout if fraud is detected, multiple accounts are linked to the same person, KYC or verification is refused or fails, information provided is false or misleading, or the User is in breach of this Policy.</p>
                    <h4>7.7 Taxation:</h4>
                    <p>The Company shall deduct tax at source (TDS) where required under Indian Income Tax law. Users remain solely responsible for declaring and paying any taxes on Rewards received.</p>
                    <h4>7.8 Non-Guarantee:</h4>
                    <p>The Company may alter, limit, suspend, or discontinue any Reward scheme, including the ₹100 promotional structure, at any time. No vested or continuing right to Rewards is created.</p>
                    <h4>7.9 REFUND & CANCELLATION POLICY (EXPLICIT):</h4>
                    <ul>
                      <li>(a) The Platform does not charge any amount from Users for participation.</li>
                      <li>(b) Users do not make payments to the Company for using the Platform.</li>
                      <li>(c) Since there is no purchase, no charge, and no debit made from the User: There are no refunds; There are no cancellations of transactions; There is no concept of "order return" or "payment reversal".</li>
                      <li>(d) This No-Refund / No-Cancellation statement is a direct consequence of the zero-fee model.</li>
                    </ul>
                    <h4>7.10 Irreversibility of Payouts:</h4>
                    <p>Once a payout is successfully executed to a valid UPI ID provided by the User, it shall generally be final and non-reversible, except in events of proven fraud, technical error, or legal requirement.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 8 */}
                <AccordionItem value="legal-8" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    No Gambling Declaration
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <p><strong>8.1</strong> The Platform is not gambling, betting, or wagering. No stake, bet, or risk of loss exists for Users.</p>
                    <p><strong>8.2</strong> The Platform does not host casino games, facilitate real-money card betting, permit sports betting, or pool User funds or stake amounts.</p>
                    <p><strong>8.3</strong> Any attempt to use the Platform for gambling or illicit financial transfers shall result in immediate termination and may be reported to authorities.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 9 */}
                <AccordionItem value="legal-9" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    Privacy Policy (DPDP Act 2023)
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <p><strong>9.1 Data Fiduciary:</strong> Halekard Private Limited acts as Data Fiduciary under the DPDP Act for Personal Data processed through the Platform.</p>
                    <p><strong>9.2 Data Collected:</strong> The Platform may collect identity data (name, mobile, email), technical data (device, OS, browser type, IP), usage data (quiz interactions, timestamps, scores), payout data (UPI ID or other payout identifiers), and compliance data (KYC documents if requested).</p>
                    <p><strong>9.3 Legal Basis for Processing:</strong> Personal Data is processed based on User consent for participating and creating an account, legitimate use for providing the service, fraud prevention and security, and legal obligations for tax, audit, or government requests.</p>
                    <p><strong>9.4 Purpose of Processing:</strong> Personal Data is processed for account creation and authentication, gameplay operations, anti-fraud and security, payout processing and record-keeping, analytics and Platform improvement, and compliance with applicable Indian laws.</p>
                    <p><strong>9.5 Data Retention:</strong> Data is retained only for as long as necessary: logs and technical data typically 90–180 days; payout and financial records up to 7 years as required by law; KYC data up to 7 years post-account closure or last payout where required.</p>
                    <p><strong>9.6 Data Sharing:</strong> The Company may share Personal Data only with payment providers necessary for executing payouts, service providers under contractual confidentiality and data protection obligations, and authorities or regulators upon lawful request, court order, or statutory requirement.</p>
                    <p><strong>9.7 No Sale of Personal Data:</strong> The Company does not sell Personal Data to any third party.</p>
                    <p><strong>9.8 User Rights:</strong> Subject to law, Users may request access to their Personal Data, request correction of inaccurate data, request deletion of data where no legal retention requirement exists, or withdraw consent which may terminate or limit access to the Platform.</p>
                    <p><strong>9.9 Minors:</strong> The Platform is not intended for persons under 18 years of age. Data relating to minors is not knowingly collected. If discovered, such data may be deleted.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 10 */}
                <AccordionItem value="legal-10" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    Data Retention & Deletion
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <p><strong>10.1</strong> Data shall be retained only as long as required for operation of the Platform, legal compliance, and fraud monitoring and dispute resolution.</p>
                    <p><strong>10.2</strong> Upon expiry of such periods, Personal Data will be deleted or irreversibly anonymised, except where retention is required by law or ongoing investigations.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 11 */}
                <AccordionItem value="legal-11" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    Cookie and Tracking Policy
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <p><strong>11.1 Purpose:</strong> The Platform may use cookies and similar technologies solely for session management, authentication, performance measurement, and security and fraud detection.</p>
                    <p><strong>11.2 No Cross-Site Tracking:</strong> The Platform does not use cookies to track Users across unrelated third-party websites for targeted advertising.</p>
                    <p><strong>11.3 User Controls:</strong> Users may manage cookies through browser settings, although disabling essential cookies may reduce or block functionality.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 12 */}
                <AccordionItem value="legal-12" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    KYC & Fraud Prevention
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <p><strong>12.1 KYC Requirements:</strong> The Company may request KYC in cases of suspicious behaviour, repeated or high-value rewards, duplicated devices or identifiers, or regulatory or banking requirements.</p>
                    <p><strong>12.2 Fraud Detection:</strong> The Company may monitor unusual patterns, including abnormal accuracy rates, rapid repetitive play, multi-account usage, or mismatched UPI details.</p>
                    <p><strong>12.3 Consequences:</strong> On detecting fraud or high-risk behaviour, the Company may block or close accounts, withhold or cancel Rewards, blacklist device identifiers, and report the matter to appropriate authorities.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 13 */}
                <AccordionItem value="legal-13" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    Responsible Play Policy
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <p><strong>13.1</strong> The Platform is meant for entertainment and learning, not for financial dependency.</p>
                    <p><strong>13.2</strong> Users are encouraged to play in moderation, take regular breaks, avoid compulsive usage, and not treat Rewards as guaranteed income or livelihood.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 14 */}
                <AccordionItem value="legal-14" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                   Security & Data Protection
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <p><strong>14.1</strong> The Company implements reasonable technical and organisational measures to protect Personal Data, including encryption of sensitive fields, secure connections (HTTPS), restricted access, and regular security assessment.</p>
                    <p><strong>14.2</strong> Users shall not attempt to bypass security mechanisms, introduce malware, or disrupt the Platform.</p>
                    <p><strong>14.3</strong> In the event of a security incident involving Personal Data, the Company will act to contain the breach, investigate the cause, and comply with any legal notification duties.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 15 */}
                <AccordionItem value="legal-15" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    Shipping & Delivery (Digital Service)
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <p><strong>15.1</strong> The Platform does not sell or ship any physical goods.</p>
                    <p><strong>15.2</strong> All services are delivered digitally and are accessible online via the Platform.</p>
                    <p><strong>15.3</strong> Therefore: there is no physical shipping; no courier or logistics obligations apply; access to the Platform is deemed "delivery" of service.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 16 */}
                <AccordionItem value="legal-16" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    Governing Law & Jurisdiction
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <p><strong>16.1</strong> This Policy is governed by and construed in accordance with the laws of India.</p>
                    <p><strong>16.2</strong> Subject to applicable law, the courts having jurisdiction over the registered office of Halekard Private Limited at Guntur, Andhra Pradesh, shall have exclusive jurisdiction over all disputes arising out of or in connection with this Policy or the Platform.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 17 */}
                <AccordionItem value="legal-17" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    Limitation of Liability
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <p><strong>17.1</strong> The Platform is provided "as-is" and "as-available", without any express or implied warranties.</p>
                    <p><strong>17.2</strong> To the maximum extent permitted by law, the Company shall not be liable for indirect, incidental, special, consequential, or punitive damages; any loss of revenue, profits, or data; or failures caused by third-party services, networks, browsers, or devices.</p>
                    <p><strong>17.3</strong> In any event, the aggregate liability of the Company shall not exceed the amount of any legitimate Reward due and unpaid to the User, subject always to fraud and policy compliance checks.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 18 */}
                <AccordionItem value="legal-18" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    Indemnification
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <p><strong>18.1</strong> The User agrees to indemnify and hold harmless the Company, its directors, officers, employees, and agents from and against any and all claims, liabilities, damages, losses, and expenses arising out of the User's breach of this Policy, misuse of the Platform, fraudulent or illegal activities, or violation of third-party rights.</p>
                    <p><strong>18.2</strong> This indemnity obligation survives termination of the User's account and any cessation of Platform use.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 19 */}
                <AccordionItem value="legal-19" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    Grievance Redressal & Contact
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <h4>19.1 Grievance Officer:</h4>
                    <p><strong>Name:</strong> Rehaman Syed<br />
                    <strong>Email:</strong> rehamansyed07@gmail.com<br />
                    <strong>Phone:</strong> +91 78427 22245<br />
                    <strong>Address:</strong> 15-1-47/2, Panasathota, Narasaraopet, Palnadu, Guntur, Andhra Pradesh – 522601</p>
                    <h4>19.2 Scope of Grievances:</h4>
                    <p>Users may contact the Grievance Officer for issues relating to account and access disputes, payout and Reward disputes, data rights under the DPDP Act, or reported abuse or security issues.</p>
                    <h4>19.3 Response Timeframe:</h4>
                    <p>The Company will use reasonable efforts to acknowledge and address grievances within timeframes consistent with applicable legal and regulatory requirements.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 20 */}
                <AccordionItem value="legal-20" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    Miscellaneous
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <h4>20.1 Severability:</h4>
                    <p>If any provision of this Policy is held to be invalid or unenforceable, the remaining provisions will continue in full force.</p>
                    <h4>20.2 No Waiver:</h4>
                    <p>Failure by the Company to enforce any provision of this Policy shall not be deemed a waiver of its rights.</p>
                    <h4>20.3 Assignment:</h4>
                    <p>The User may not assign or transfer any rights or obligations under this Policy. The Company may assign its rights or obligations without restriction.</p>
                    <h4>20.4 Entire Agreement:</h4>
                    <p>This Policy constitutes the entire agreement between the User and the Company in relation to the Platform and supersedes all prior understandings.</p>
                  </AccordionContent>
                </AccordionItem>

                {/* Legal 21 */}
                <AccordionItem value="legal-21" className="bg-card border rounded-lg px-4">
                  <AccordionTrigger className="text-base font-semibold hover:text-red-500">
                    Version Control & Effective Date
                  </AccordionTrigger>
                  <AccordionContent className="prose dark:prose-invert max-w-none">
                    <h4>21.1 Version:</h4>
                    <p>This is Version 2.0.0 of the IndCric Strict-Legal Policy Suite.</p>
                    <h4>21.2 Effective Date:</h4>
                    <p>This Policy takes effect from the date it is first published by the Company and remains in force until replaced or revoked.</p>
                    <h4>21.3 Amendments:</h4>
                    <p>The Company may amend this Policy for reasons including, but not limited to, changes in law, regulatory guidance, security improvements, or operational changes. Continued use of the Platform after any amendment constitutes acceptance of the revised Policy.</p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </AccordionContent>
          </AccordionItem>
        </div>
      </Accordion>
    </div>
  )
}
