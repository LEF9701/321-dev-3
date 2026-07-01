package com.smartestate.seed;

import com.smartestate.model.BylawDoc;
import com.smartestate.model.Language;
import com.smartestate.repo.BylawDocRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/** Seeds the bilingual bylaw / FAQ corpus that the RAG chatbot retrieves over (FR-8.1). */
@Component
@Order(2)
public class AiCorpusSeeder implements CommandLineRunner {

    private final BylawDocRepository repo;

    public AiCorpusSeeder(BylawDocRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;

        doc("BL-FEES", "Management fee payment and late charges", Language.EN, "Fees",
            "Management fees are payable monthly in advance and fall due on the first day of each month. "
            + "Payment may be made by autopay, at the management office, or by cheque. If a fee remains unpaid "
            + "for more than 30 days it becomes overdue and a late charge of 5% is added to the outstanding balance. "
            + "Persistent non-payment may be referred to the Owners' Corporation for recovery. "
            + "管理費須每月預繳，並於每月一日到期。逾期超過30天即屬欠繳，並會被徵收百分之五的逾期附加費。");

        doc("BL-NOISE", "Noise and quiet hours", Language.EN, "Noise",
            "Residents must not cause noise that disturbs neighbours. Quiet hours are from 23:00 to 08:00, "
            + "during which no drilling, loud music, mahjong, or other noisy activities are permitted. "
            + "Repeated noise complaints may be reported to the management office and, where necessary, the police. "
            + "安靜時段為晚上11時至翌日早上8時，期間不得進行鑽牆、播放響亮音樂或打麻將等擾人活動。");

        doc("BL-RENO", "Renovation rules, permitted hours and permits", Language.EN, "Renovation",
            "Renovation works require prior written approval from the management office and a refundable deposit. "
            + "Works producing noise or dust are only allowed Monday to Saturday from 09:00 to 18:00, and are not "
            + "permitted on Sundays or public holidays. Debris must be removed daily and the lift protected. "
            + "Structural alterations affecting load-bearing walls are strictly prohibited. "
            + "裝修須先向管理處申請書面批准並繳付按金。產生噪音或塵埃的工程只可於星期一至六上午9時至下午6時進行，星期日及公眾假期不得進行。");

        doc("BL-PET", "Pet policy", Language.EN, "Pets",
            "Small domestic pets such as cats and small dogs are permitted provided they do not cause a nuisance. "
            + "Dogs must be leashed in all common areas and owners must clean up after them immediately. "
            + "Pets are not allowed in the lift lobby seating area or the children's playground. "
            + "Aggressive breeds and any animal causing repeated complaints may be ordered removed.");

        doc("BL-FIRE", "Fire safety — keep escape routes clear", Language.EN, "Fire safety",
            "Corridors, staircases, and lift lobbies are designated means of escape and must be kept completely clear "
            + "at all times. Do not store bicycles, shoe cabinets, plants, or any belongings in these areas, as they "
            + "obstruct evacuation and are a fire hazard. Fire doors must never be propped open. In case of fire, use "
            + "the staircase, never the lift, and proceed to the assembly area at the basketball court. "
            + "走廊、樓梯及升降機大堂均屬走火通道，必須時刻保持暢通，切勿擺放雜物。火警時請使用樓梯逃生，切勿使用升降機。");

        doc("BL-PARK", "Car park rules", Language.EN, "Car park",
            "Parking spaces are allocated to registered tenants only and may not be sub-let. Vehicles must display a "
            + "valid parking permit. The speed limit within the car park is 10 km/h. Visitor parking is available on a "
            + "first-come basis at the hourly rate posted at the entrance. Unauthorised or abandoned vehicles may be clamped.");

        doc("BL-WATER", "Water supply and tank cleaning", Language.EN, "Water",
            "The fresh water tanks are cleaned and disinfected twice a year as required by law. Notice of any temporary "
            + "water suspension is given at least three days in advance through the notification system. Residents are "
            + "advised to store sufficient water before a scheduled suspension. Report any discoloured water to the office.");

        doc("BL-MEETING", "Owners' Corporation general meetings (BMO)", Language.EN, "Meetings",
            "Under the Building Management Ordinance (Cap. 344), notice of an Owners' Corporation general meeting must "
            + "be given to all owners at least 14 days before the meeting, stating the date, time, venue and agenda. "
            + "An owner unable to attend may appoint a proxy in writing. Resolutions are passed by a majority of votes "
            + "of the owners present and voting.");

        doc("BL-WASTE", "Refuse disposal and recycling", Language.EN, "Waste",
            "Household refuse must be bagged and placed in the refuse room on each floor, not left in the corridor. "
            + "Recyclables (paper, plastic, metal) should be sorted into the recycling bins on the ground floor. "
            + "Large items such as furniture require prior arrangement with the management office for disposal.");

        doc("BL-SUBLET", "Subletting and tenancy registration", Language.EN, "Tenancy",
            "Owners who let their flat must register the tenancy and the occupants with the management office and ensure "
            + "tenants observe the estate bylaws. The owner remains responsible for the management fees and for the "
            + "conduct of their tenants. Short-term holiday letting is not permitted.");

        doc("BL-COMMON", "Use of common areas and podium", Language.EN, "Common area",
            "Common areas including the podium garden and sitting-out areas are for the quiet enjoyment of all residents. "
            + "Commercial activities, hawking, and the erection of structures are not allowed. Children must be supervised "
            + "in the playground. The function room may be booked through the management office.");

        doc("BL-AC", "Air-conditioner installation and condensate", Language.EN, "Air-conditioning",
            "Air-conditioners must be installed on the designated platform and fitted with a proper drainage pipe so that "
            + "condensate does not drip onto the unit below or into the common corridor. Dripping air-conditioners are a "
            + "common source of disputes; the resident responsible must rectify the drainage promptly upon notice.");

        doc("FAQ-MOVE", "How to move in or out / booking the lift", Language.EN, "FAQ",
            "To move furniture in or out, book the service lift with the management office at least one working day in "
            + "advance. Moving is allowed between 09:00 and 18:00. Lift protection padding will be installed. A refundable "
            + "deposit may be required against damage to common areas during the move.");

        doc("FAQ-LEAK", "Water seepage between flats — what to do", Language.EN, "FAQ",
            "If water is seeping from the flat above, report it to the management office immediately. The office will "
            + "arrange a joint inspection of both flats to locate the source. Seepage is often caused by a failed waterproof "
            + "membrane or a leaking pipe. The owner of the flat where the defect originates is responsible for the repair. "
            + "如懷疑樓上單位滲水，請立即通知管理處安排上下單位聯合檢查，找出滲水源頭。");

        doc("FAQ-LOCKOUT", "Locked out or lost keys", Language.EN, "FAQ",
            "The management office does not hold spare keys to private flats for security reasons. If you are locked out, "
            + "you will need to engage a licensed locksmith at your own cost. Please update your contact details with the "
            + "office so we can reach you in an emergency.");

        doc("FAQ-EMERGENCY", "What to do in a fire or typhoon", Language.EN, "FAQ",
            "In a fire, evacuate immediately via the nearest staircase, never the lift, and assemble at the basketball "
            + "court. During a Typhoon Signal No. 8 or Black Rainstorm Warning, stay indoors, secure windows, and avoid "
            + "the podium and open areas; non-emergency estate services are suspended. Follow instructions sent through "
            + "the Smart Estate notification system.");
    }

    private void doc(String code, String title, Language lang, String category, String content) {
        BylawDoc d = new BylawDoc();
        d.setCode(code);
        d.setTitle(title);
        d.setLanguage(lang);
        d.setCategory(category);
        d.setContent(content);
        repo.save(d);
    }
}
